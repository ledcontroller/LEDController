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
const ERRORS = require('restify-errors');

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
const PARAMS = {}
for(let i = 0; i < process.argv.length; i++) {
    if (process.argv[i].startsWith("-")) {
        let param = process.argv[i].substring(1, process.argv[i].length)
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

const TOKEN: string = PARAMS["token"] || "SUPERSECRETCODE"; // If noone sniffs the packets this is fine :]
const API_PORT: number = PARAMS["port"] || 1234;
const UPDATES_PER_SECOND: number = PARAMS["ups"] || 120;
const API_NAME: string = PARAMS["apiname"] || "led_controller";
const VERSION: string = "0.2.0"
const STRIPCONTROLLER: string = PARAMS["stripcontroller"] || "TextToVideoStripController";

let uptime: number = new Date().getTime();

//Load the controller and create a instance
let strip: IStripController;
try {
    const stripcontrollerClass = __non_webpack_require__(STRIPCONTROLLER.toLowerCase()).default;
    strip = new stripcontrollerClass(PARAMS);
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

const animationController: AnimationController = new AnimationController(strip);

const API = RSF.createServer({
    name: "localhost"
});
API.use(RSF.plugins.bodyParser());

function checkToken(req, res, next): void {
    if (req.body.token && req.body.token === TOKEN) {
        return next();
    }
    return next(new ERRORS.UnauthorizedError("Wrong Token"));
}

function sendSuccess(res): void {
    res.contentType = "json";
    res.send(200, {"status": 200, "message": "LEDs changed"});
}

API.post("/" + API_NAME + "/api/animations/*", checkToken, (req, res, next) => {
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

    sendSuccess(res);
    return next();
});


API.post("/" + API_NAME + "/api/notification/", checkToken, (req, res, next) => {
    for(let notification of req.body.notifications) {
        notification.ledCount = LEDCOUNT;

        //Get Animation Class and Initialize with Parameters from Request
        let NotificationClass = NOTIFICATIONS[notification.effect];
        if (NotificationClass) {
            try {
                animationController.playNotification(new NotificationClass(notification))
            } catch (error) {
                if (error instanceof ParameterParsingError) {
                    return next(new ERRORS.BadRequestError(error.message))
                }
            }
        } else {
            return next(new ERRORS.NotFoundError("Notification not found"));
        }
    }

    sendSuccess(res);
    return next();
});

API.post("/" + API_NAME + "/api/notifications/*", checkToken, (req, res, next) => {
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

    sendSuccess(res);
    return next();
});

API.post("/" + API_NAME + "/api/start", checkToken, (req, res, next) => {
    if (req.body.update_per_second) {
        animationController.start(req.body.update_per_second);
    } else {
        return next(new ERRORS.BadRequestError("Wrong or insufficient parameters"))
    }
    
    sendSuccess(res);
    return next();
});

API.post("/" + API_NAME + "/api/stop", checkToken, (req, res, next) => {
    animationController.stopUpdate();
    animationController.clearLEDs();

    sendSuccess(res);
    return next();
});

API.post("/" + API_NAME + "/api/status", checkToken, (req, res, next) => {
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

// Start on Application startup
animationController.start(UPDATES_PER_SECOND);

API.listen(API_PORT, function() {
    console.log('LED-Controller %s', VERSION);
    console.log('Listening on Port %s', API_PORT);
    console.log('Name: %s', API_NAME);
    console.log('Accesstoken: %s', TOKEN);
    console.log('Updates per second: %s', UPDATES_PER_SECOND);
    console.log('Number of LEDs: %s', LEDCOUNT);
});

function exitApplication() {
    strip.off();
    strip.shutdown();
    console.log("Bye!");
    process.exit(0);
}

process.on ("SIGINT", () => exitApplication());
process.on ("SIGTERM", () => exitApplication());