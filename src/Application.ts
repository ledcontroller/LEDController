import {AnimationController} from "./AnimationController";
import {Blink} from "./Animations/Blink";
import {SideToCenter} from "./Animations/SideToCenter";
import {CenterToSide} from "./Animations/CenterToSide";
import {SideToSide} from "./Animations/SideToSide";
import {Fade} from "./Animations/Fade";
import {BlinkNotification} from "./Notifications/BlinkNotification";
import { CenterToSideNotification } from "./Notifications/CenterToSideNotification";
import {ParameterParsingError} from "./Errors/ParameterParsingError";
import {AnimationNotRunningError} from "./Errors/AnimationNotRunningError";
import { IStripController } from "./IStripController";

const RSF = require("restify");
const ERRORS = require("restify-errors");
const FS = require("fs");

const ANIMATIONS = {
    "blink": Blink,
    "sidetocenter": SideToCenter,
    "centertoside": CenterToSide,
    "sidetoside": SideToSide,
    "fade": Fade
};

const NOTIFICATIONS = {
    "blink": BlinkNotification,
    "centertoside": CenterToSideNotification,
};

// Parameter parsing
const PARAMS = {};
for(let i = 0; i < process.argv.length; i++) {
    if (process.argv[i].startsWith("-")) {
        let param = process.argv[i].substring(1, process.argv[i].length);
        let value = param.split("=")[1]; //check if null
        if (value.startsWith("\"") && value.endsWith("\"")) {
            value = value.substring(1);
            value = value.substr(0, value.length - 2);
        }
        PARAMS[param.split("=")[0]] = value
    }
}

PARAMS["ledcount"] = PARAMS["ledcount"] || 182; 
const LEDCOUNT: number = PARAMS["ledcount"];

const TOKEN: string = PARAMS["token"] || "SUPERSECRETCODE"; // If https is used this is safe in my opinion
const API_PORT: number = PARAMS["port"] || 1234;
const UPDATES_PER_SECOND: number = PARAMS["ups"] || 120;
const API_NAME: string = PARAMS["apiname"] || "led_controller";
const VERSION: string = "0.2.0";
const STRIPCONTROLLER: string = PARAMS["stripcontroller"] || "TextToVideoStripController";
const PRIVATEKEY: String = PARAMS["privatekey"];
const PUBLICKEY: String = PARAMS["publickey"];

let uptime: number = new Date().getTime();



//
//   LED setup
//

//Load the controller and create a instance
let strip: IStripController = loadStripController();
const animationController: AnimationController = new AnimationController(strip);



//
//   API init and middleware
//

// Check if cert is available and check if both keys are available
const API_OPTIONS = { name: API_NAME };
if (PRIVATEKEY || PUBLICKEY) {
    if (!FS.existsSync(PRIVATEKEY) || !FS.existsSync(PUBLICKEY)) {
        console.error("Private or Public Key couldn't be found");
        process.exit(1);
    }
    API_OPTIONS["key"] = FS.readFileSync(PRIVATEKEY);
    API_OPTIONS["certificate"] = FS.readFileSync(PUBLICKEY);
} else {
    console.log("Using no certificate is not recommended");
}

const API = RSF.createServer(API_OPTIONS);
API.use(RSF.plugins.bodyParser());

// Check if the token is used in basic authorization as password for user "token"
API.use(RSF.plugins.authorizationParser());
API.use((req, res, next) => {
    // Skip for status
    if (req.getPath().endsWith("status")) return next();
    if (req.username !== "token" || req.authorization.basic.password !== TOKEN) {
        return next(new ERRORS.UnauthorizedError("Wrong Token"));
    }
    return next();
});

// Simple logging
API.on("Unauthorized", (req, res, err, cb) => {
    console.error(err);
    cb();
});



//
//   ENDPOINTS
//

API.post("/" + API_NAME + "/api/animations/*", (req, res, next) => {
    let path = req.route.path;
    let animationName = req.url.split(path.substring(0, path.lastIndexOf('/') + 1))[1];
    let parameters = req.body.animation;
    parameters.ledCount = LEDCOUNT;
    
    let AnimationClass = ANIMATIONS[animationName];
    if (AnimationClass) {
        try {
            let animation = new AnimationClass(parameters);            
            animationController.changeAnimation(animation);
        } catch (error) {
            if (error instanceof ParameterParsingError) {
                return next(new ERRORS.BadRequestError(error.message));
            }
            if (error instanceof AnimationNotRunningError) {
                return next(new ERRORS.ServiceUnavailableError(error.message));
            }
        }
    } else {
        return next(new ERRORS.NotFoundError("Animation not found"));
    }

    res.contentType = "json";
    res.send(200, {"status": 200, "message": "Changed Animation"});
    return next();
});

API.post("/" + API_NAME + "/api/notification/", (req, res, next) => {
    for(let notification of req.body.notifications) {
        notification.ledCount = LEDCOUNT;

        //Get Animation Class and Initialize with Parameters from Request
        let NotificationClass = NOTIFICATIONS[notification.effect];
        if (NotificationClass) {
            if (!notification.parameters) {
                return next(new ERRORS.BadRequestError("No Parameters provided"));
            }
            try {
                animationController.playNotification(new NotificationClass(notification.parameters))
            } catch (error) {
                if (error instanceof ParameterParsingError) {
                    return next(new ERRORS.BadRequestError(error.message))
                }
            }
        } else {
            return next(new ERRORS.NotFoundError("Notification not found"));
        }
    }

    res.contentType = "json";
    res.send(200, {"status": 200, "message": "Added Notifications to queue"});
    return next();
});

API.post("/" + API_NAME + "/api/notifications/*", (req, res, next) => {
    let path = req.route.path;
    let notificationName = req.url.split(path.substring(0, path.lastIndexOf('/') + 1))[1];
    let parameters = req.body.notification;
    parameters.ledCount = LEDCOUNT;
    
    let NotificationClass = NOTIFICATIONS[notificationName];
    if (NotificationClass) {
        try {
            let notification = new NotificationClass(parameters);            
            animationController.playNotification(notification);
        } catch (error) {
            return next(new ERRORS.BadRequestError("Wrong or insufficient parameters"))
        }
    } else {
        return next(new ERRORS.NotFoundError("Notification not found"));
    }

    res.contentType = "json";
    res.send(200, {"status": 200, "message": "Added Notification to queue"});
    return next();
});

API.post("/" + API_NAME + "/api/start", (req, res, next) => {
    if (req.body.update_per_second) {
        animationController.start(req.body.update_per_second);
    } else {
        return next(new ERRORS.BadRequestError("Wrong or insufficient parameters"))
    }

    res.contentType = "json";
    res.send(200, {"status": 200, "message": "Started animation"});
    return next();
});

API.get("/" + API_NAME + "/api/stop", (req, res, next) => {
    animationController.stopUpdate();
    animationController.clearLEDs();

    res.contentType = "json";
    res.send(200, {"status": 200, "message": "Stopped animation"});
    return next();
});

API.get("/" + API_NAME + "/api/status", (req, res, next) => {
    res.contentType = "json";
    
    // Get the name of the current Animation 
    let currentAnimationName: string = "None";
    if (animationController.running) {
        for (let animation in ANIMATIONS) {
            if (ANIMATIONS.hasOwnProperty(animation)) {
                if (animationController.animation instanceof ANIMATIONS[animation]) {
                    currentAnimationName = animation;
                    break;
                }
            }
        }
    }
    res.send(200, {
        "status": 200, 
        "updates_per_second": animationController.ups,
        "running": animationController.running,
        "isPlayingNotification": animationController.isPlayingNotification,
        "version": VERSION,
        "uptime": new Date().getTime() - uptime,
        "animation": currentAnimationName,
    });
    return next();
});



//
//   Application Start
//

animationController.start(UPDATES_PER_SECOND);

API.listen(API_PORT, function() {
    console.log('LED-Controller %s', VERSION);
    console.log('Listening on Port %s', API_PORT);
    console.log('Name: %s', API_NAME);
    console.log('Accesstoken: %s', TOKEN);
    console.log('Updates per second: %s', UPDATES_PER_SECOND);
    console.log('Number of LEDs: %s', LEDCOUNT);
});



//
//   Helping Functions
//

function exitApplication() {
    API.close(() => {
        strip.off();
        strip.shutdown(() => {
            console.log("Bye!");
            process.exit(0);
        });
    });
}

function loadStripController() : IStripController {
    try {
        const stripControllerClass = __non_webpack_require__(STRIPCONTROLLER.toLowerCase()).default;
        return(new stripControllerClass(PARAMS));
    } catch (error) {
        if (error.hasOwnProperty("type")) {
            if (error.type === "parameter") {
                console.error(error.message);
            }
        } else {
            console.error(`Couldn't find ${STRIPCONTROLLER} \n\t either it's not installed or you misspelled it`);
        }
        console.error(error);
    
        process.exit(1);
    }
}

process.on ("SIGINT", () => exitApplication());
process.on ("SIGTERM", () => exitApplication());