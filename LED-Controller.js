#!/usr/local/bin/node
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/Application.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/AnimationController.ts":
/*!************************************!*\
  !*** ./src/AnimationController.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationController = void 0;
const Led_1 = __webpack_require__(/*! ./Led */ "./src/Led.ts");
const Blink_1 = __webpack_require__(/*! ./Animations/Blink */ "./src/Animations/Blink.ts");
/**
 * AnimationController handles the playback of Animations and Notifications
 */
class AnimationController {
    /**
     * AnimationController handles the playback of Animations and Notifications
     * @param strip Strip Controller
     */
    constructor(strip) {
        this.animation = new Blink_1.Blink({ colors: [{ r: 0, g: 255, b: 0, a: 0.2 }], duration: 1000 });
        this.leds = [];
        this.isPlayingNotification = false;
        this.notificationStack = [];
        this.strip = strip;
        // Init LEDs
        for (let i = 0; i < this.strip.getLength(); i++) {
            this.leds.push(new Led_1.Led({ r: 0, g: 0, b: 0, a: 0 }));
        }
    }
    /**
     * Changes the Animation
     * @param newAnimation New Animation ot be played
     * @throws {AnimationNotRunningError} Animation loop must me running
     */
    changeAnimation(newAnimation) {
        //if (!this.running) throw new AnimationNotRunningError("Animationloop currently not running!");
        if (this.isPlayingNotification) {
            this.afterNotificationAnimation = newAnimation;
        }
        else {
            this.animation = newAnimation;
        }
    }
    /**
     * Stops the current Animation and plays the specified Notification
     * @param notification Notification to be played
     */
    playNotification(notification) {
        if (this.isPlayingNotification) {
            this.notificationStack.push(notification);
            return;
        }
        this.afterNotificationAnimation = this.animation;
        notification.attachDoneCallback(() => {
            this.animation = this.afterNotificationAnimation;
            this.isPlayingNotification = false;
            // Play next Notification
            if (this.notificationStack.length > 0) {
                this.playNotification(this.notificationStack.shift());
                return;
            }
            else {
                this.update();
            }
        });
        this.animation = notification;
        this.isPlayingNotification = true;
    }
    /**
     * Calls the Animation/Notification update function
     */
    update() {
        this.animation.update(this.leds, this.strip, this.afterNotificationAnimation);
    }
    /**
     * Starts the Animation loop
     * @param updatesPerSeconde Times the update function will be called per second
     */
    start(updatesPerSeconde) {
        if (!this.running) {
            this.ups = updatesPerSeconde;
            this.loop = global.setInterval(this.update.bind(this), 1000 / updatesPerSeconde);
            this.running = true;
        }
    }
    /**
     * Stops the Animation loop
     */
    stopUpdate() {
        clearInterval(this.loop);
        this.running = false;
    }
    /**
     * Clears LED-Strip and clears internal LED-Array
     * All LEDs are set to white
     */
    clearLEDs() {
        this.strip.clear();
        for (let i = 0; i < this.strip.getLength(); i++) {
            this.leds.push(new Led_1.Led({ r: 0, g: 0, b: 0, a: 1 }));
        }
        this.strip.sync();
    }
}
exports.AnimationController = AnimationController;


/***/ }),

/***/ "./src/Animations/Blink.ts":
/*!*********************************!*\
  !*** ./src/Animations/Blink.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Blink = void 0;
const ParameterParsingError_1 = __webpack_require__(/*! ../Errors/ParameterParsingError */ "./src/Errors/ParameterParsingError.ts");
class Blink {
    constructor(requestParameter) {
        this.curColor = 0;
        this.frameCounter = 0;
        this.colors = requestParameter.colors;
        this.activeTime = requestParameter.duration;
        this.frameCounter = requestParameter.duration; // Color gets set at first Update
        if (!(this.colors && this.activeTime && this.frameCounter)) {
            throw new ParameterParsingError_1.ParameterParsingError("Wrong parameter provided");
        }
    }
    update(leds, strip) {
        if (++this.frameCounter > this.activeTime) {
            this.frameCounter = 0;
            if (++this.curColor >= this.colors.length)
                this.curColor = 0;
            strip.all(this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
            strip.sync();
        }
    }
}
exports.Blink = Blink;


/***/ }),

/***/ "./src/Animations/CenterToSide.ts":
/*!****************************************!*\
  !*** ./src/Animations/CenterToSide.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CenterToSide = void 0;
const ParameterParsingError_1 = __webpack_require__(/*! ../Errors/ParameterParsingError */ "./src/Errors/ParameterParsingError.ts");
class CenterToSide {
    constructor(requestParameter) {
        this.curColor = 0;
        this.border = 0;
        this.persBorder = 0;
        this.centerLED = 0;
        this.ledcount = 0;
        this.colors = requestParameter.colors;
        this.centerLED = Math.round(requestParameter.ledCount * 0.5);
        this.ledsPreFrame = this.centerLED / requestParameter.duration;
        this.ledcount = requestParameter.ledCount;
        if (!(this.colors && this.centerLED && this.ledsPreFrame)) {
            throw new ParameterParsingError_1.ParameterParsingError("Wrong parameter provided");
        }
    }
    update(leds, strip) {
        // Front
        for (let i = this.centerLED; i < this.centerLED + this.border && i <= this.ledcount; i++) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }
        // Back
        for (let i = this.centerLED; i > this.centerLED - this.border && i >= 0; i--) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }
        this.persBorder += this.ledsPreFrame;
        this.border = Math.round(this.persBorder);
        if (this.border > leds.length * 0.5) {
            this.border = 0;
            this.persBorder = 0;
            if (++this.curColor >= this.colors.length)
                this.curColor = 0;
        }
        strip.sync();
    }
}
exports.CenterToSide = CenterToSide;


/***/ }),

/***/ "./src/Animations/Fade.ts":
/*!********************************!*\
  !*** ./src/Animations/Fade.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Fade = void 0;
const ParameterParsingError_1 = __webpack_require__(/*! ../Errors/ParameterParsingError */ "./src/Errors/ParameterParsingError.ts");
class Fade {
    constructor(requestParameter) {
        this.curColor = 0;
        this.steps = 0;
        this.curStep = 0;
        this.curFrame = 0;
        this.colors = requestParameter.colors;
        this.steps = Math.round(requestParameter.duration / requestParameter.smoothness) || 1; // Atleast 1 step
        this.smoothness = requestParameter.smoothness;
        if (!(this.colors && this.steps && this.smoothness)) {
            throw new ParameterParsingError_1.ParameterParsingError("Wrong parameter provided");
        }
        this.calculateNextColorAndSteps();
    }
    update(leds, strip) {
        if (this.curFrame == this.smoothness) {
            this.curFrame = 0;
            this.curStep++;
            if (this.curStep >= this.colorSteps.length) {
                this.calculateNextColorAndSteps();
                this.curStep = 0;
            }
            strip.all(this.colorSteps[this.curStep].r, this.colorSteps[this.curStep].g, this.colorSteps[this.curStep].b, this.colorSteps[this.curStep].a);
            strip.sync();
        }
        this.curFrame++;
    }
    calculateNextColorAndSteps() {
        if (++this.curColor >= this.colors.length)
            this.curColor = 0;
        let cur_Color = this.colors[this.curColor];
        let next_Color = this.colors[this.curColor + 1 >= this.colors.length ? 0 : this.curColor + 1];
        let red = cur_Color.r;
        let green = cur_Color.g;
        let blue = cur_Color.b;
        let alpha = cur_Color.a;
        let red_steps = (next_Color.r - cur_Color.r) / this.steps;
        let green_steps = (next_Color.g - cur_Color.g) / this.steps;
        let blue_steps = (next_Color.b - cur_Color.b) / this.steps;
        let alpha_steps = (next_Color.a - cur_Color.a) / this.steps;
        this.colorSteps = [];
        for (let i = 0; i < this.steps; i++) {
            red += red_steps;
            green += green_steps;
            blue += blue_steps;
            alpha += alpha_steps;
            this.colorSteps.push({
                r: red < 0 ? 0 : red > 255 ? 255 : red,
                g: green < 0 ? 0 : green > 255 ? 255 : green,
                b: blue < 0 ? 0 : blue > 255 ? 255 : blue,
                a: alpha
            });
        }
    }
}
exports.Fade = Fade;


/***/ }),

/***/ "./src/Animations/Fire.ts":
/*!********************************!*\
  !*** ./src/Animations/Fire.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Fire = void 0;
const ParameterParsingError_1 = __webpack_require__(/*! ../Errors/ParameterParsingError */ "./src/Errors/ParameterParsingError.ts");
class Fire {
    constructor(requestParameter) {
        this.colors = requestParameter.colors;
        this.maxFadeDuration = requestParameter.maxFadeDuration;
        this.minFadeDuration = requestParameter.minFadeDuration;
        this.ledcount = requestParameter.ledCount;
        this.pixelOntime = new Array();
        for (let i = 0; i < this.ledcount; i++) {
            this.pixelOntime.push(0);
        }
        if (!(this.colors && this.minFadeDuration && this.minFadeDuration)) {
            throw new ParameterParsingError_1.ParameterParsingError("Wrong parameter provided");
        }
    }
    update(leds, strip) {
        for (let i = 0; i < this.ledcount; i++) {
            if (this.pixelOntime[i] <= 0) {
                // change color
                this.pixelOntime[i] = Math.round(this.minFadeDuration + (Math.random() * (this.maxFadeDuration - this.minFadeDuration)));
                let color = this.colors[Math.round(Math.random() * (this.colors.length - 1))];
                leds[i].color = color;
                strip.set(i, color.r, color.g, color.b, color.a);
            }
            else {
                this.pixelOntime[i]--;
            }
        }
        strip.sync();
    }
}
exports.Fire = Fire;


/***/ }),

/***/ "./src/Animations/SideToCenter.ts":
/*!****************************************!*\
  !*** ./src/Animations/SideToCenter.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SideToCenter = void 0;
const ParameterParsingError_1 = __webpack_require__(/*! ../Errors/ParameterParsingError */ "./src/Errors/ParameterParsingError.ts");
class SideToCenter {
    constructor(requestParameter) {
        this.curColor = 0;
        this.border = 0;
        this.percBorder = 0;
        this.colors = requestParameter.colors;
        this.ledsPerFrame = (requestParameter.ledCount * 0.5) / requestParameter.duration;
        if (!(this.colors && this.ledsPerFrame)) {
            throw new ParameterParsingError_1.ParameterParsingError("Wrong parameter provided");
        }
    }
    update(leds, strip) {
        // Front
        for (let i = 0; i < this.border; i++) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }
        // Back
        for (let i = leds.length - 1; i > leds.length - this.border; i--) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }
        this.percBorder += this.ledsPerFrame;
        this.border = Math.round(this.percBorder);
        if (this.border > leds.length * 0.5) {
            //Fill Center LEDs too
            strip.all(this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
            this.border = 0;
            this.percBorder = 0;
            if (++this.curColor >= this.colors.length)
                this.curColor = 0;
        }
        strip.sync();
    }
}
exports.SideToCenter = SideToCenter;


/***/ }),

/***/ "./src/Animations/SideToSide.ts":
/*!**************************************!*\
  !*** ./src/Animations/SideToSide.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SideToSide = void 0;
const ParameterParsingError_1 = __webpack_require__(/*! ../Errors/ParameterParsingError */ "./src/Errors/ParameterParsingError.ts");
class SideToSide {
    constructor(requestParameter) {
        this.curColor = 0;
        this.direction = true;
        this.border = 0;
        this.percBorder = 0; // Used to calc LED Speeds below 0
        this.ledcount = 0;
        this.colors = requestParameter.colors;
        this.ledsPerFrame = requestParameter.ledCount / requestParameter.duration;
        this.ledcount = requestParameter.ledCount;
        if (!(this.colors && this.ledsPerFrame)) {
            throw new ParameterParsingError_1.ParameterParsingError("Wrong parameter provided");
        }
    }
    update(leds, strip) {
        if (this.direction) {
            for (let i = this.border; i < this.border + this.ledsPerFrame && i <= this.ledcount; i++) {
                strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
            }
            this.percBorder += this.ledsPerFrame;
            this.border = Math.round(this.percBorder);
        }
        else {
            for (let i = this.border; i > this.border - this.ledsPerFrame && i >= 0; i--) {
                strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
            }
            this.percBorder -= this.ledsPerFrame;
            this.border = Math.round(this.percBorder);
        }
        if (this.border >= leds.length) {
            this.border = leds.length;
            this.percBorder = leds.length;
            if (++this.curColor >= this.colors.length)
                this.curColor = 0;
            this.direction = !this.direction;
        }
        else if (this.border <= 0) {
            this.border = 0;
            this.percBorder = 0;
            if (++this.curColor >= this.colors.length)
                this.curColor = 0;
            this.direction = !this.direction;
        }
        strip.sync();
    }
}
exports.SideToSide = SideToSide;


/***/ }),

/***/ "./src/Application.ts":
/*!****************************!*\
  !*** ./src/Application.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const AnimationController_1 = __webpack_require__(/*! ./AnimationController */ "./src/AnimationController.ts");
const Blink_1 = __webpack_require__(/*! ./Animations/Blink */ "./src/Animations/Blink.ts");
const SideToCenter_1 = __webpack_require__(/*! ./Animations/SideToCenter */ "./src/Animations/SideToCenter.ts");
const CenterToSide_1 = __webpack_require__(/*! ./Animations/CenterToSide */ "./src/Animations/CenterToSide.ts");
const SideToSide_1 = __webpack_require__(/*! ./Animations/SideToSide */ "./src/Animations/SideToSide.ts");
const Fade_1 = __webpack_require__(/*! ./Animations/Fade */ "./src/Animations/Fade.ts");
const BlinkNotification_1 = __webpack_require__(/*! ./Notifications/BlinkNotification */ "./src/Notifications/BlinkNotification.ts");
const CenterToSideNotification_1 = __webpack_require__(/*! ./Notifications/CenterToSideNotification */ "./src/Notifications/CenterToSideNotification.ts");
const ParameterParsingError_1 = __webpack_require__(/*! ./Errors/ParameterParsingError */ "./src/Errors/ParameterParsingError.ts");
const AnimationNotRunningError_1 = __webpack_require__(/*! ./Errors/AnimationNotRunningError */ "./src/Errors/AnimationNotRunningError.ts");
const RippleToCenterNotification_1 = __webpack_require__(/*! ./Notifications/RippleToCenterNotification */ "./src/Notifications/RippleToCenterNotification.ts");
const Fire_1 = __webpack_require__(/*! ./Animations/Fire */ "./src/Animations/Fire.ts");
const RSF = __webpack_require__(/*! restify */ "restify");
const ERRORS = __webpack_require__(/*! restify-errors */ "restify-errors");
const FS = __webpack_require__(/*! fs */ "fs");
// Loads the default Animations
const ANIMATIONS = {
    "blink": Blink_1.Blink,
    "sidetocenter": SideToCenter_1.SideToCenter,
    "centertoside": CenterToSide_1.CenterToSide,
    "sidetoside": SideToSide_1.SideToSide,
    "fade": Fade_1.Fade,
    "fire": Fire_1.Fire,
};
// Loads the default Notifications
const NOTIFICATIONS = {
    "blink": BlinkNotification_1.BlinkNotification,
    "centertoside": CenterToSideNotification_1.CenterToSideNotification,
    "rippletocenter": RippleToCenterNotification_1.RippleToCenterNotification,
};
const VERSION = "0.2.0";
// Welcome
console.log('LED-Controller %s', VERSION);
console.log('by Lukas Sturm');
const ARGUMENTS = parseArguments(process.argv);
// Default parameters
ARGUMENTS["ledcount"] = ARGUMENTS["ledcount"] || 182;
const LEDCOUNT = ARGUMENTS["ledcount"];
const TOKEN = ARGUMENTS["token"] || "SUPERSECRETCODE"; // This is super bad practice. A proper Token management needs to be implemented
const API_PORT = ARGUMENTS["port"] || 1234;
const UPDATES_PER_SECOND = ARGUMENTS["ups"] || 30;
const API_NAME = ARGUMENTS["apiname"] || "led_controller";
const STRIPCONTROLLER = ARGUMENTS["stripcontroller"];
const PRIVATEKEY = ARGUMENTS["privatekey"];
const PUBLICKEY = ARGUMENTS["publickey"];
const USEHTTP = ARGUMENTS["http"];
let uptime = new Date().getTime();
let API;
//
//   LED setup
//
//Load the controller and create a instance
let strip = instantiateStripController(STRIPCONTROLLER);
const animationController = new AnimationController_1.AnimationController(strip);
//
//   API init and middleware
//
const API_OPTIONS = { name: API_NAME };
// Check if cert is available and check if both keys are available
if (!USEHTTP) {
    if (PRIVATEKEY || PUBLICKEY) {
        console.log("Using provided Certificate");
        if (!FS.existsSync(PRIVATEKEY) || !FS.existsSync(PUBLICKEY)) {
            console.error("Private or Public Key couldn't be found");
            exitApplication();
        }
        API_OPTIONS["key"] = FS.readFileSync(PRIVATEKEY);
        API_OPTIONS["certificate"] = FS.readFileSync(PUBLICKEY);
    }
    else {
        console.error("No Certificate provided! \nUse -http to run the API without certificates");
        exitApplication(); // User should be aware that he is not using a cert and the flag needs to be set by him
    }
}
else {
    console.warn("Running in unsecure HTTP mode \nConsider using a certificate to encrypt API access");
}
API = RSF.createServer(API_OPTIONS);
API.use(RSF.plugins.bodyParser());
// Check if the token is used in basic authorization as password for user "token"
API.use(RSF.plugins.authorizationParser());
API.use((req, res, next) => {
    // Skip for status
    if (req.getPath().endsWith("/status"))
        return next();
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
        }
        catch (error) {
            if (error instanceof ParameterParsingError_1.ParameterParsingError) {
                return next(new ERRORS.BadRequestError(error.message));
            }
            if (error instanceof AnimationNotRunningError_1.AnimationNotRunningError) {
                return next(new ERRORS.ServiceUnavailableError(error.message));
            }
        }
    }
    else {
        return next(new ERRORS.NotFoundError("Animation not found"));
    }
    res.contentType = "json";
    res.send(200, { "status": 200, "message": "Changed Animation" });
    return next();
});
API.post("/" + API_NAME + "/api/notification/", (req, res, next) => {
    for (let notification of req.body.notifications) {
        notification.ledCount = LEDCOUNT;
        //Get Animation Class and Initialize with Parameters from Request
        let NotificationClass = NOTIFICATIONS[notification.effect];
        if (NotificationClass) {
            if (!notification.parameters) {
                return next(new ERRORS.BadRequestError("No Parameters provided"));
            }
            try {
                animationController.playNotification(new NotificationClass(notification.parameters));
            }
            catch (error) {
                if (error instanceof ParameterParsingError_1.ParameterParsingError) {
                    return next(new ERRORS.BadRequestError(error.message));
                }
            }
        }
        else {
            return next(new ERRORS.NotFoundError("Notification not found"));
        }
    }
    res.contentType = "json";
    res.send(200, { "status": 200, "message": "Added Notifications to queue" });
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
        }
        catch (error) {
            return next(new ERRORS.BadRequestError("Wrong or insufficient parameters"));
        }
    }
    else {
        return next(new ERRORS.NotFoundError("Notification not found"));
    }
    res.contentType = "json";
    res.send(200, { "status": 200, "message": "Added Notification to queue" });
    return next();
});
API.post("/" + API_NAME + "/api/start", (req, res, next) => {
    if (req.body.update_per_second) {
        animationController.start(req.body.update_per_second);
    }
    else {
        return next(new ERRORS.BadRequestError("Wrong or insufficient parameters"));
    }
    res.contentType = "json";
    res.send(200, { "status": 200, "message": "Started animation" });
    return next();
});
API.get("/" + API_NAME + "/api/stop", (req, res, next) => {
    animationController.stopUpdate();
    animationController.clearLEDs();
    res.contentType = "json";
    res.send(200, { "status": 200, "message": "Stopped animation" });
    return next();
});
API.get("/" + API_NAME + "/api/status", (req, res, next) => {
    res.contentType = "json";
    // Get the name of the current Animation 
    let currentAnimationName = "None";
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
API.listen(API_PORT, function () {
    console.log('API listening on Port %s', API_PORT);
    console.log('Name: %s', API_NAME);
    console.log('Accesstoken: %s', TOKEN);
    console.log('Updates per second: %s', UPDATES_PER_SECOND);
    console.log('Number of LEDs: %s', LEDCOUNT);
});
//
//   Helping Functions
//
function exitApplication() {
    if (API !== null && API !== undefined) {
        API.close(() => {
            strip.off();
            strip.shutdown(() => {
                console.log("Bye!");
                process.exit(0);
            });
        });
    }
    else {
        console.log("Bye!");
        process.exit(0);
    }
}
function instantiateStripController(controllerModuleName) {
    if (!(typeof controllerModuleName === "string")) {
        console.error(`No Controllermodule supplied! Use the "stripcontroller" option to specify one`);
        exitApplication();
    }
    try {
        const stripControllerClass = require(controllerModuleName.toLowerCase()).default;
        return (new stripControllerClass(ARGUMENTS));
    }
    catch (error) {
        if (error.hasOwnProperty("type")) {
            if (error.type === "parameter") {
                console.error(error.message);
            }
        }
        else {
            console.error(`Couldn't find ${controllerModuleName} either it's not installed or you misspelled it`);
        }
        exitApplication();
    }
}
// parses Arguments
function parseArguments(commandlineArguments) {
    let args = {};
    for (let i = 0; i < commandlineArguments.length; i++) {
        if (commandlineArguments[i].startsWith("-")) {
            let argName = commandlineArguments[i].substring(1, commandlineArguments[i].length); //remove "-"
            let argNameLength = argName.length;
            if (argNameLength > 0) {
                // check if parameters for argument are provided
                if (i + 1 < commandlineArguments.length) {
                    let param = commandlineArguments[i + 1];
                    if (param[0] === "-") {
                        // single option
                        args[argName] = true;
                    }
                    else {
                        // argument with parameter
                        // check if argument is split by spaces
                        if (param.startsWith("'") || param.startsWith('"')) {
                            // Parameter escaped
                            // search for end
                            param = param.substring(1, param.length);
                            for (let j = i; i < commandlineArguments.length; i++) {
                                let searchingArgu = commandlineArguments[j];
                                if (searchingArgu.endsWith("'") || searchingArgu.endsWith('"')) {
                                    param = param.concat(searchingArgu.substring(0, searchingArgu.length - 1));
                                    i = j; // Set i to the end of the arguments option
                                    break;
                                }
                                else {
                                    param = param.concat(searchingArgu);
                                }
                            }
                        }
                        // Parameter not escaped
                        args[argName] = param;
                        i++; // Advance i to skip the parameter
                    }
                }
                else {
                    // no more arguments so this has to be an option
                    args[argName] = true;
                }
            }
        }
    }
    return args;
}
process.on("SIGINT", () => exitApplication());
process.on("SIGTERM", () => exitApplication());


/***/ }),

/***/ "./src/Errors/AnimationNotRunningError.ts":
/*!************************************************!*\
  !*** ./src/Errors/AnimationNotRunningError.ts ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationNotRunningError = void 0;
class AnimationNotRunningError extends Error {
    constructor(message) {
        super(message);
        Error.captureStackTrace(this, AnimationNotRunningError);
    }
}
exports.AnimationNotRunningError = AnimationNotRunningError;


/***/ }),

/***/ "./src/Errors/ParameterParsingError.ts":
/*!*********************************************!*\
  !*** ./src/Errors/ParameterParsingError.ts ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ParameterParsingError = void 0;
class ParameterParsingError extends Error {
    constructor(message) {
        super(message);
        Error.captureStackTrace(this, ParameterParsingError);
    }
}
exports.ParameterParsingError = ParameterParsingError;


/***/ }),

/***/ "./src/Led.ts":
/*!********************!*\
  !*** ./src/Led.ts ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Led = void 0;
class Led {
    constructor(color) {
        this.color = color;
    }
}
exports.Led = Led;


/***/ }),

/***/ "./src/Notifications/BlinkNotification.ts":
/*!************************************************!*\
  !*** ./src/Notifications/BlinkNotification.ts ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.BlinkNotification = void 0;
const ParameterParsingError_1 = __webpack_require__(/*! ../Errors/ParameterParsingError */ "./src/Errors/ParameterParsingError.ts");
class BlinkNotification {
    constructor(requestParameter) {
        this.curColor = -1; // first run skips first color
        this.frameCounter = 0;
        this.colors = requestParameter.colors;
        this.activeTime = requestParameter.duration;
        this.frameCounter = this.activeTime; // Color gets set at first Update
        if (!(this.colors && this.activeTime)) {
            throw new ParameterParsingError_1.ParameterParsingError("Wrong parameter provided");
        }
    }
    attachDoneCallback(callback) {
        this.finishCallback = callback;
    }
    update(leds, strip) {
        if (++this.frameCounter > this.activeTime) {
            this.frameCounter = 0;
            if (++this.curColor >= this.colors.length) {
                this.finishCallback();
                return;
            }
            strip.all(this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
            strip.sync();
        }
    }
}
exports.BlinkNotification = BlinkNotification;


/***/ }),

/***/ "./src/Notifications/CenterToSideNotification.ts":
/*!*******************************************************!*\
  !*** ./src/Notifications/CenterToSideNotification.ts ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CenterToSideNotification = void 0;
const ParameterParsingError_1 = __webpack_require__(/*! ../Errors/ParameterParsingError */ "./src/Errors/ParameterParsingError.ts");
class CenterToSideNotification {
    constructor(requestParameter) {
        this.curColor = 0;
        this.border = 0;
        this.centerLED = 0;
        this.colors = requestParameter.colors;
        this.centerLED = Math.round(requestParameter.ledCount * 0.5);
        this.ledsPreFrame = Math.round(this.centerLED / requestParameter.duration);
        if (!(this.colors && this.centerLED && this.ledsPreFrame)) {
            throw new ParameterParsingError_1.ParameterParsingError("Wrong parameter provided");
        }
    }
    attachDoneCallback(callback) {
        this.finishCallback = callback;
    }
    update(leds, strip) {
        // Front
        for (let i = this.centerLED; i < this.centerLED + this.border; i++) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }
        // Back
        for (let i = this.centerLED; i > this.centerLED - this.border; i--) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }
        strip.sync();
        this.border += this.ledsPreFrame;
        if (this.border > leds.length * 0.5) {
            this.border = 0;
            if (++this.curColor >= this.colors.length)
                this.finishCallback();
        }
    }
}
exports.CenterToSideNotification = CenterToSideNotification;


/***/ }),

/***/ "./src/Notifications/RippleToCenterNotification.ts":
/*!*********************************************************!*\
  !*** ./src/Notifications/RippleToCenterNotification.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.RippleToCenterNotification = void 0;
const ParameterParsingError_1 = __webpack_require__(/*! ../Errors/ParameterParsingError */ "./src/Errors/ParameterParsingError.ts");
class RippleToCenterNotification {
    constructor(requestParameter) {
        this.curCycle = 0;
        this.border = 0;
        this.persBorder = 0;
        this.color = requestParameter.color;
        this.cycles = requestParameter.cycles || 4;
        this.centerLED = Math.round(requestParameter.ledCount / 2);
        this.amount = requestParameter.amount || 3;
        this.ledsPerFrame = this.centerLED / requestParameter.cycleDuration;
        this.size = requestParameter.size || 10;
        this.keepAnimationRunning = requestParameter.keepAnimationRunning || false;
        if (this.color === undefined) {
            throw new ParameterParsingError_1.ParameterParsingError("Wrong parameter provided");
        }
    }
    attachDoneCallback(doneCallback) {
        this.doneCallback = doneCallback;
    }
    update(led, strip, animation) {
        if (this.keepAnimationRunning) {
            animation.update(led, strip, animation);
        }
        else {
            strip.clear();
        }
        let curLed = 0;
        let isRipple = false;
        let curAmount = 0;
        for (let i = this.border; i > 0; i--) {
            // Switch leds off after x amount of leds have been lit
            if (++curLed % this.size == 0) {
                isRipple = !isRipple;
                if (curAmount++ == this.amount + 1)
                    break;
            }
            if (isRipple && i < this.centerLED) {
                strip.set(i, this.color.r, this.color.g, this.color.b, this.color.a);
                strip.set(strip.getLength() - i, this.color.r, this.color.g, this.color.b, this.color.a);
            }
        }
        strip.sync();
        this.persBorder += this.ledsPerFrame;
        this.border = Math.round(this.persBorder);
        if (this.border > this.centerLED + this.amount * this.size * 2 - this.size) {
            this.persBorder = this.border = 0;
            if (++this.curCycle == this.cycles) {
                this.doneCallback();
            }
        }
    }
}
exports.RippleToCenterNotification = RippleToCenterNotification;


/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "restify":
/*!**************************!*\
  !*** external "restify" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("restify");

/***/ }),

/***/ "restify-errors":
/*!*********************************!*\
  !*** external "restify-errors" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("restify-errors");

/***/ })

/******/ });
//# sourceMappingURL=LED-Controller.js.map