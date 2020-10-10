import { AnimationController } from "./AnimationController";
import { IStripController } from "./Interfaces/IStripController";
import { API, APIOptions } from "./API";
import { Log } from "./Logger"; 

const FS = require("fs");
const VERSION: string = "0.3.0";

// Welcome
// LED-Controller Version ${VERSION}
// by Lukas Sturm

const ARGUMENTS = parseArguments(process.argv);

// Default parameters
ARGUMENTS["ledcount"] = ARGUMENTS["ledcount"] || 182;
const LEDCOUNT: number = ARGUMENTS["ledcount"];
const TOKEN: string = ARGUMENTS["token"] || "SUPERSECRETCODE"; // This is super bad practice. A proper Token management needs to be implemented
const API_PORT: number = ARGUMENTS["port"] || 1234;
const UPDATES_PER_SECOND: number = ARGUMENTS["ups"] || 30;
const STRIPCONTROLLER: string = ARGUMENTS["stripcontroller"];
const PRIVATEKEY: string = ARGUMENTS["privatekey"];
const PUBLICKEY: string = ARGUMENTS["publickey"];
const USEHTTP: boolean = ARGUMENTS["http"];

let api : API;

//
//   LED setup
//

//Load the controller and create a instance
let strip: IStripController = instantiateStripController(STRIPCONTROLLER);
const animationController: AnimationController = new AnimationController(strip);


//
//   API init and middleware
//
const API_OPTIONS : APIOptions = {
    port: API_PORT,
    version: VERSION,
    token: TOKEN
};


// Check if cert is available and check if both keys are available
if (!USEHTTP) {
    if (PRIVATEKEY || PUBLICKEY) {
        Log.info("Using provided Certificate");
        if (!FS.existsSync(PRIVATEKEY) || !FS.existsSync(PUBLICKEY)) {
            Log.error("Private or Public Key couldn't be found");
            exitApplication();
        }
        API_OPTIONS["key"] = FS.readFileSync(PRIVATEKEY);
        API_OPTIONS["certificate"] = FS.readFileSync(PUBLICKEY);
    } else {
        Log.error("No Certificate provided!");
        Log.error("Use -http to run the API without the need of certificates");
        exitApplication(); // User should be aware that he is not using a cert and the flag needs to be set by him
    }
} else {
    Log.warn("Running in unsecure HTTP mode");
    Log.warn("Consider using a certificate to encrypt API access");
}

api = new API(animationController, API_OPTIONS);


//
//   Application Start
//

animationController.start(UPDATES_PER_SECOND);

api.listen(() => {
    Log.info(`API on Port: ${API_PORT}`);
    Log.info(`Accesstoken: ${TOKEN}`);
    Log.info(`Updates per second: ${UPDATES_PER_SECOND}`);
    Log.info(`Number of LEDs: ${LEDCOUNT}`);
});



//
//   Helping Functions
//

function exitApplication() : void {
    if (api !== null && api !== undefined) {
        api.close(() => {
            strip.off();
            strip.shutdown(() => {
                process.exit(0);
            });
        });
    } else {
        process.exit(0);
    }
}

function instantiateStripController(controllerModuleName : string) : IStripController {
    if (!(typeof controllerModuleName === "string")) {
        Log.error(`No Controllermodule supplied! Use the "stripcontroller" option to specify one`);
        exitApplication();
    }

    try {
        const stripControllerClass : any = __non_webpack_require__(controllerModuleName.toLowerCase()).default;
        return(new stripControllerClass(ARGUMENTS));
    } catch (error) {
        Log.error(`Error loading stripcontroller ${error.message}`);    
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
                            let quoteChar: string = param[0];
                            // Parameter escaped
                            // search for end
                            param = param.substring(1, param.length);
                            for (let j : number = i; i < commandlineArguments.length; i++) {
                                let searchingArgu : string = commandlineArguments[j];
                                if (searchingArgu.endsWith(quoteChar)) {
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