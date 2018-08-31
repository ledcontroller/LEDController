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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
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

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./src/AnimationController.ts":
/*!************************************!*\
  !*** ./src/AnimationController.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Led_1 = __webpack_require__(/*! ./Led */ "./src/Led.ts");
const Static_1 = __webpack_require__(/*! ./Animations/Static */ "./src/Animations/Static.ts");
class AnimationController {
    constructor(strip) {
        this.animation = new Static_1.Static({ r: 0, g: 255, b: 0, a: 0.2 });
        this.leds = [];
        this.isPlayingNotification = false;
        this.notificationStack = [];
        this.strip = strip;
        // Init LEDs
        for (let i = 0; i < this.strip.length; i++) {
            this.leds.push(new Led_1.Led({ r: 0, g: 0, b: 0, a: 0 }));
        }
    }
    changeAnimation(newAnimation) {
        if (this.isPlayingNotification) {
            this.afterNotificationAnimation = newAnimation;
        }
        else {
            this.animation = newAnimation;
        }
    }
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
                this.playNotification(this.notificationStack.pop());
                return;
            }
            else {
                this.update();
            }
        });
        this.animation = notification;
        this.isPlayingNotification = true;
    }
    update() {
        this.animation.update(this.leds, this.strip);
    }
    start(updatesPerSeconde) {
        if (!this.running) {
            this.ups = updatesPerSeconde;
            this.loop = setInterval(this.update.bind(this), 1000 / updatesPerSeconde);
            this.running = true;
        }
    }
    stopUpdate() {
        clearInterval(this.loop);
        this.running = false;
    }
    turnoffLEDs() {
        this.strip.off();
    }
    clearLEDs() {
        this.strip.clear();
        for (let i = 0; i < this.strip.length; i++) {
            this.leds.push(new Led_1.Led({ r: 0, g: 0, b: 0, a: 0 }));
        }
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
class Blink {
    constructor(requestParameter) {
        this.curColor = 0;
        this.frameCounter = 0;
        this.colors = requestParameter.colors;
        this.activeTime = requestParameter.duration;
        this.frameCounter = requestParameter.duration; // Color gets set at first Update
        if (!(this.colors && this.activeTime && this.frameCounter)) {
            throw new Error("Wrong Parameter");
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
class CenterToSide {
    constructor(requestParameter) {
        this.curColor = 0;
        this.border = 0;
        this.centerLED = 0;
        this.ledcount = 0;
        this.colors = requestParameter.colors;
        this.centerLED = Math.round(requestParameter.ledCount * 0.5);
        this.ledsPreFrame = Math.round(this.centerLED / requestParameter.duration);
        this.ledcount = requestParameter.ledCount;
        if (!(this.colors && this.centerLED && this.ledsPreFrame)) {
            throw new Error("Wrong Parameter");
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
        this.border += this.ledsPreFrame;
        if (this.border > leds.length * 0.5) {
            this.border = 0;
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
class Fade {
    constructor(requestParameter) {
        this.curColor = 0;
        this.steps = 0;
        this.curStep = 0;
        this.curFrame = 0;
        this.colors = requestParameter.colors;
        this.steps = Math.round(requestParameter.duration / requestParameter.smoothness);
        this.smoothness = requestParameter.smoothness;
        if (!(this.colors && this.steps && this.smoothness)) {
            throw new Error("Wrong Parameter");
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

/***/ "./src/Animations/SideToCenter.ts":
/*!****************************************!*\
  !*** ./src/Animations/SideToCenter.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class SideToCenter {
    constructor(requestParameter) {
        this.curColor = 0;
        this.border = 0;
        this.colors = requestParameter.colors;
        this.ledsPreFrame = Math.round((requestParameter.ledCount * 0.5) / requestParameter.duration);
        if (!(this.colors && this.ledsPreFrame)) {
            throw new Error("Wrong Parameter");
        }
    }
    update(leds, strip) {
        // Front
        for (let i = 0; i < this.border; i++) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }
        // Back
        for (let i = leds.length; i > leds.length - this.border; i--) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }
        this.border += this.ledsPreFrame;
        if (this.border > leds.length * 0.5) {
            //Fill Center LEDs too
            strip.all(this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
            this.border = 0;
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
class SideToSide {
    constructor(requestParameter) {
        this.curColor = 0;
        this.direction = true;
        this.border = 0;
        this.ledcount = 0;
        this.colors = requestParameter.colors;
        this.ledsPreFrame = Math.round(requestParameter.ledCount / requestParameter.duration);
        this.ledcount = requestParameter.ledCount;
        if (!(this.colors && this.ledsPreFrame)) {
            throw new Error("Wrong Parameter");
        }
    }
    update(leds, strip) {
        if (this.direction) {
            for (let i = this.border; i < this.border + this.ledsPreFrame && i <= this.ledcount; i++) {
                strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
            }
            this.border += this.ledsPreFrame;
        }
        else {
            for (let i = this.border; i > this.border - this.ledsPreFrame && i >= 0; i--) {
                strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
            }
            this.border -= this.ledsPreFrame;
        }
        if (this.border >= leds.length) {
            this.border = leds.length;
            if (++this.curColor >= this.colors.length)
                this.curColor = 0;
            this.direction = !this.direction;
        }
        else if (this.border <= 0) {
            this.border = 0;
            if (++this.curColor >= this.colors.length)
                this.curColor = 0;
            this.direction = !this.direction;
        }
        strip.sync();
    }
}
exports.SideToSide = SideToSide;


/***/ }),

/***/ "./src/Animations/Static.ts":
/*!**********************************!*\
  !*** ./src/Animations/Static.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Static {
    constructor(color) {
        this.color = color;
    }
    update(leds, strip) {
        strip.all(this.color.r, this.color.g, this.color.b, this.color.a);
        strip.sync();
    }
}
exports.Static = Static;


/***/ }),

/***/ "./src/Application.ts":
/*!****************************!*\
  !*** ./src/Application.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {
Object.defineProperty(exports, "__esModule", { value: true });
const AnimationController_1 = __webpack_require__(/*! ./AnimationController */ "./src/AnimationController.ts");
const Blink_1 = __webpack_require__(/*! ./Animations/Blink */ "./src/Animations/Blink.ts");
const SideToCenter_1 = __webpack_require__(/*! ./Animations/SideToCenter */ "./src/Animations/SideToCenter.ts");
const CenterToSide_1 = __webpack_require__(/*! ./Animations/CenterToSide */ "./src/Animations/CenterToSide.ts");
const SideToSide_1 = __webpack_require__(/*! ./Animations/SideToSide */ "./src/Animations/SideToSide.ts");
const Fade_1 = __webpack_require__(/*! ./Animations/Fade */ "./src/Animations/Fade.ts");
const BlinkNotification_1 = __webpack_require__(/*! ./Notifications/BlinkNotification */ "./src/Notifications/BlinkNotification.ts");
const CenterToSideNotification_1 = __webpack_require__(/*! ./Notifications/CenterToSideNotification */ "./src/Notifications/CenterToSideNotification.ts");
const HEAPDUMP = __webpack_require__(/*! heapdump */ "heapdump");
const DOT = __webpack_require__(/*! dotstar */ "dotstar");
const SPI = __webpack_require__(/*! pi-spi */ "pi-spi");
const RSF = __webpack_require__(/*! restify */ "restify");
const ERRORS = __webpack_require__(/*! restify-errors */ "restify-errors");
const ANIMATIONS = {
    "blink": Blink_1.Blink,
    "sidetocenter": SideToCenter_1.SideToCenter,
    "centertoside": CenterToSide_1.CenterToSide,
    "sidetoside": SideToSide_1.SideToSide,
    "fade": Fade_1.Fade
};
const NOTIFICATIONS = {
    "blink": BlinkNotification_1.BlinkNotification,
    "centertoside": CenterToSideNotification_1.CenterToSideNotification,
};
const PARAMS = {};
for (let i = 2; i < process.argv.length; i++) {
    process.argv[i];
    let param = process.argv[i].substring(1, process.argv[i].length);
    PARAMS[param.split("=")[0]] = param.split("=")[1];
}
/*
    -token="asdf"
    -port=1234
    -ups=120
    -ledcount=182
    -spi=""
*/
const TOKEN = PARAMS["token"] || "SUPERSECRETCODE"; // If noone sniffs the packets this is fine :]
const API_PORT = PARAMS["port"] || 1234;
const UPDATES_PER_SECOND = PARAMS["ups"] || 120;
const LEDCOUNT = PARAMS["ledcount"] || 182;
const RASBISPI = PARAMS["spi"] || "/dev/spidev0.0";
const spi = SPI.initialize(RASBISPI);
class MySPI {
    write(buffer, callback) {
        callback(undefined, buffer);
    }
}
//const spi = new MySPI();
const strip = new DOT.Dotstar(spi, {
    length: LEDCOUNT
});
const animationController = new AnimationController_1.AnimationController(strip);
const API = RSF.createServer({
    name: "tisch-led-rasbi"
});
API.use(RSF.plugins.bodyParser());
function checkToken(req, res, next) {
    if (req.body.token && req.body.token === TOKEN) {
        return next();
    }
    return next(new ERRORS.UnauthorizedError("Wrong Token"));
}
function sendSuccess(res) {
    res.contentType = "json",
        res.send(200, { "status": 200, "message": "LEDs changed" });
}
API.post("/tisch_leds/debug/heapdump", (req, res, next) => {
    HEAPDUMP.writeSnapshot();
    sendSuccess(res);
    return next();
});
API.post("/tisch_leds/api/animations/*", checkToken, (req, res, next) => {
    let path = req.route.path;
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
            return next(new ERRORS.BadRequestError("Wrong or insufficient parameters"));
        }
    }
    else {
        return next(new ERRORS.NotFoundError("Animation not found"));
    }
    sendSuccess(res);
    return next();
});
API.post("/tisch_leds/api/notifications/*", checkToken, (req, res, next) => {
    let path = req.route.path;
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
    sendSuccess(res);
    return next();
});
API.post("/tisch_leds/api/start", checkToken, (req, res, next) => {
    if (req.body.update_per_second) {
        animationController.start(req.body.update_per_second);
    }
    else {
        return next(new ERRORS.BadRequestError("Wrong or insufficient parameters"));
    }
    sendSuccess(res);
    return next();
});
API.post("/tisch_leds/api/stop", checkToken, (req, res, next) => {
    animationController.stopUpdate();
    animationController.clearLEDs();
    sendSuccess(res);
    return next();
});
animationController.start(UPDATES_PER_SECOND);
API.listen(API_PORT, function () {
    console.log('LED-Controller listening on Port %s', API_PORT);
    console.log('Accesstoken: %s', TOKEN);
    console.log('Updates per second: %s', UPDATES_PER_SECOND);
    console.log('Number of LEDs: %s', LEDCOUNT);
    console.log('SPI path: %s', RASBISPI);
});

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./src/Led.ts":
/*!********************!*\
  !*** ./src/Led.ts ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
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
class BlinkNotification {
    constructor(requestParameter) {
        this.curColor = -1; // first run skips first color
        this.frameCounter = 0;
        this.colors = requestParameter.colors;
        this.activeTime = requestParameter.duration;
        this.frameCounter = this.activeTime; // Color gets set at first Update
        if (!(this.colors && this.activeTime)) {
            throw new Error("Wrong Parameter");
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
class CenterToSideNotification {
    constructor(requestParameter) {
        this.curColor = 0;
        this.border = 0;
        this.centerLED = 0;
        this.colors = requestParameter.colors;
        this.centerLED = Math.round(requestParameter.ledCount * 0.5);
        this.ledsPreFrame = Math.round(this.centerLED / requestParameter.duration);
        if (!(this.colors && this.centerLED && this.ledsPreFrame)) {
            throw new Error("Wrong Parameter");
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

/***/ "dotstar":
/*!**************************!*\
  !*** external "dotstar" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("dotstar");

/***/ }),

/***/ "heapdump":
/*!***************************!*\
  !*** external "heapdump" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("heapdump");

/***/ }),

/***/ "pi-spi":
/*!*************************!*\
  !*** external "pi-spi" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("pi-spi");

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