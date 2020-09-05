import { createCA, createDeviceCert, retrivePublicKey, retrivePrivateKey, certAvailable, caCertAvailable } from "./CertUtils";
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
import { IStripController } from "./Interfaces/IStripController";
import {RippleToCenterNotification} from "./Notifications/RippleToCenterNotification";
import { Fire } from "./Animations/Fire";
import { Server, ServerOptions } from "restify";

const RSF = require("restify");
const ERRORS = require("restify-errors");
const FS = require("fs");

// Loads the default Animations
const ANIMATIONS = {
    "blink": Blink,
    "sidetocenter": SideToCenter,
    "centertoside": CenterToSide,
    "sidetoside": SideToSide,
    "fade": Fade,
    "fire": Fire,
};

// Loads the default Notifications
const NOTIFICATIONS = {
    "blink": BlinkNotification,
    "centertoside": CenterToSideNotification,
    "rippletocenter": RippleToCenterNotification,
};
const VERSION: string = "0.2.0";

// Welcome
console.log('LED-Controller %s', VERSION);
console.log('by Lukas Sturm');

const ARGUMENTS = parseArguments(process.argv);

// Default parameters
ARGUMENTS["ledcount"] = ARGUMENTS["ledcount"] || 182;
const LEDCOUNT: number = ARGUMENTS["ledcount"];
const TOKEN: string = ARGUMENTS["token"] || "SUPERSECRETCODE"; // This is super bad practice. A proper Token management needs to be implemented
const API_PORT: number = ARGUMENTS["port"] || 1234;
const UPDATES_PER_SECOND: number = ARGUMENTS["ups"] || 30;
const API_NAME: string = ARGUMENTS["apiname"] || "led_controller";
const STRIPCONTROLLER: string = ARGUMENTS["stripcontroller"] || "TextToVideoStripController";
const PRIVATEKEY: string = ARGUMENTS["privatekey"];
const PUBLICKEY: string = ARGUMENTS["publickey"];

let uptime: number = new Date().getTime();
let API : Server;

//
//   LED setup
//

//Load the controller and create a instance
let strip: IStripController = instantiateStripController(STRIPCONTROLLER);
const animationController: AnimationController = new AnimationController(strip);


//
//   API init and middleware
//
const API_OPTIONS : ServerOptions = { name: API_NAME };


// Check if cert is available and check if both keys are available
if (PRIVATEKEY || PUBLICKEY) {
    console.log("Using provided Certificate");
    if (!FS.existsSync(PRIVATEKEY) || !FS.existsSync(PUBLICKEY)) {
        console.error("Private or Public Key couldn't be found");
        exitApplication();
    }
    API_OPTIONS["key"] = FS.readFileSync(PRIVATEKEY);
    API_OPTIONS["certificate"] = FS.readFileSync(PUBLICKEY);
} else {
    console.log("Using selfsigned Certificate");

    if (!caCertAvailable() || ARGUMENTS["forcenewca"] || ARGUMENTS["fca"]) {
        console.log("Generating certificate authority, this might take some time!");
        try {    
            createCA();
        } catch (error) {
            console.error("Error while generating certificate authority");
            console.error(error.message);
            exitApplication();
        }
    }

    if (!certAvailable() || ARGUMENTS["forcenewcert"] || ARGUMENTS["fcert"]) {
        console.log("Generating device certificate, this might take some time!");
        try {    
            createDeviceCert(); 
        } catch (error) {
            console.error("Error while generating device certificate");
            console.error(error.message);
            exitApplication();
        }
    }

    API_OPTIONS["key"] = retrivePrivateKey();
    API_OPTIONS["certificate"] = retrivePublicKey();
}


// check if any certificate is loaded
if (API_OPTIONS["key"] === undefined || API_OPTIONS["key"] === "") {
    console.error("No Certificate provided! \nIf you don't use a dynDNS you can use the \"selfsigned-cert\" option to create a Certificate");
    // More info
    exitApplication();
}


API = RSF.createServer(API_OPTIONS);
API.use(RSF.plugins.bodyParser());

// Check if the token is used in basic authorization as password for user "token"
API.use(RSF.plugins.authorizationParser());
API.use((req, res, next) => {
    // Skip for status
    if (req.getPath().endsWith("/status")) return next();
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
    let path = req.getPath();
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
    let path = req.getPath();
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
    console.log('API listening on Port %s', API_PORT);
    console.log('Name: %s', API_NAME);
    console.log('Accesstoken: %s', TOKEN);
    console.log('Updates per second: %s', UPDATES_PER_SECOND);
    console.log('Number of LEDs: %s', LEDCOUNT);
});



//
//   Helping Functions
//

function exitApplication() : void {
    if (API !== null && API !== undefined) {
        API.close(() => {
            strip.off();
            strip.shutdown(() => {
                console.log("Bye!");
                process.exit(0);
            });
        });
    } else {
        console.log("Bye!");
        process.exit(0);
    }
}

function instantiateStripController(controllerModuleName : string) : IStripController {
    if (!(typeof controllerModuleName === "string")) {
        console.error(`No Controllermodule supplied! Use the "stripcontroller" option to specify one`);
        exitApplication();
    }

    try {
        const stripControllerClass : any = __non_webpack_require__(controllerModuleName.toLowerCase()).default;
        return(new stripControllerClass(ARGUMENTS));
    } catch (error) {
        if (error.hasOwnProperty("type")) {
            if (error.type === "parameter") {
                console.error(error.message);
            }
        } else {
            console.error(`Couldn't find ${controllerModuleName} \n\t either it's not installed or you misspelled it`);
        }
    
        exitApplication();
    }
}

// parses Arguments
function parseArguments(commandlineArguments : Array<string>) : any {
    let args : any = {};
    for(let i = 0; i < commandlineArguments.length; i++) {
        if (commandlineArguments[i].startsWith("-")) {
            let argName : string = commandlineArguments[i].substring(1, commandlineArguments[i].length); //remove "-"
            let argNameLength : number = argName.length;
            if (argNameLength > 0) {
                // check if parameters for argument are provided
                if (i + 1 < commandlineArguments.length) {
                    let param : string = commandlineArguments[i + 1];
                    if (param[0] === "-") {
                        // single option
                        args[argName] = true;
                    } else {
                        // argument with parameter

                        // check if argument is split by spaces
                        if (param.startsWith("'") || param.startsWith('"')) {
                            // Parameter escaped
                            // search for end
                            param = param.substring(1, param.length);
                            for (let j : number = i; i < commandlineArguments.length; i++) {
                                let searchingArgu : string = commandlineArguments[j];
                                if (searchingArgu.endsWith("'") || searchingArgu.endsWith('"')) {
                                    param = param.concat(searchingArgu.substring(0, searchingArgu.length - 1));
                                    i = j; // Set i to the end of the arguments option
                                    break;
                                } else {
                                    param = param.concat(searchingArgu);
                                }
                            }
                        } 
                        
                        // Parameter not escaped
                        args[argName] = param;
                        i++; // Advance i to skip the parameter
                    }
                } else {
                    // no more arguments so this has to be an option
                    args[argName] = true;
                }
            }
        }
    }
    return args;
}

process.on ("SIGINT", () => exitApplication());
process.on ("SIGTERM", () => exitApplication());