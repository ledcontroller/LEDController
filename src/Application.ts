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

const DOT = require("dotstar");
const SPI = require("pi-spi");
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
        let value = param.split("=")[1];
        if (value.startsWith("\"") && value.endsWith("\"")) {
            value = value.substring(1);
            value = value.substr(0, value.length - 2);
        }
        PARAMS[param.split("=")[0]] = value
    }
}

const TOKEN = PARAMS["token"] || "SUPERSECRETCODE"; // If noone sniffs the packets this is fine :]
const API_PORT = PARAMS["port"] || 1234;
const UPDATES_PER_SECOND = PARAMS["ups"] || 120;
const LEDCOUNT = PARAMS["ledcount"] || 182;
const RASPISPI = PARAMS["spi"] || "/dev/spidev0.0";
const API_NAME = PARAMS["apiname"] || "led_controller";
const VERSION = "0.1.0"

const spi = SPI.initialize(RASPISPI);
const strip = new DOT.Dotstar(spi, {
    length: LEDCOUNT
});
const animationController = new AnimationController(strip);

const API = RSF.createServer({
    name: "tisch-led-rasbi"
});
API.use(RSF.plugins.bodyParser());

function checkToken(req, res, next): void {
    if (req.body.token && req.body.token === TOKEN) {
        return next();
    }
    return next(new ERRORS.UnauthorizedError("Wrong Token"));
}

function sendSuccess(res): void {
    res.contentType = "json",
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
    res.contentType = "json",
    res.send(200, {
        "status": 200, 
        "updates_per_second": animationController.ups,
        "running": animationController.running,
        "isPlayingNotification": animationController.isPlayingNotification,
        "version": VERSION
    });
    return next();
});


animationController.start(UPDATES_PER_SECOND);

API.listen(API_PORT, function() {
    console.log('LED-Controller %s', VERSION);
    console.log('Listening on Port %s', API_PORT);
    console.log('Name: %s', API_NAME);
    console.log('Accesstoken: %s', TOKEN);
    console.log('Updates per second: %s', UPDATES_PER_SECOND);
    console.log('Number of LEDs: %s', LEDCOUNT);
    console.log('SPI path: %s', RASPISPI);
});

function exitApplication() {
    strip.off();
    spi.close();
    console.log("Bye!");
}

process.on ("SIGINT", () => exitApplication());
process.on ("SIGTERM", () => {
    exitApplication();
    process.exit(0);
});