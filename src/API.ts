import { AnimationController } from "./AnimationController";
import { Next, Request, Response, Server } from "restify";
import { HttpError } from "restify-errors";
import { ParameterParsingError } from "./Errors/ParameterParsingError";
import { AnimationNotRunningError } from "./Errors/AnimationNotRunningError";
import { AnimationStore } from "./AnimationStore";
import { AnimationNotFoundError } from "./Errors/AnimationNotFoundError";
import { Log, LogAPI } from "./Logger";

const ERRORS = require("restify-errors");
const RSF = require("restify");

export class API {    
    private animationController: AnimationController;
    private server: Server; 
    private options: APIOptions;
    private uptime: number;
    private animationStore: AnimationStore;
    
    constructor(animationController: AnimationController, options: APIOptions) {
        this.animationController = animationController;
        this.server = RSF.createServer(options);
        this.server.use(RSF.plugins.bodyParser());
        this.server.use(RSF.plugins.authorizationParser());
        this.server.use(RSF.pre.sanitizePath());
        this.options = options;
        this.uptime = new Date().getTime();
        this.animationStore = AnimationStore.getInstance();

        // this.server.use((req : Request, res : Response, next : Next) => {
        //     LogAPI.info(req.method + " - " + req.url + " - " + JSON.stringify(req.body));
        //     return next();
        // });

        // Check if the token is used in basic authorization as password for user "token"
        this.server.use((req : Request, res : Response, next : Next) => {
            if (req.username !== "token" || req.authorization.basic.password !== this.options.token) {
                return next(new ERRORS.UnauthorizedError("Wrong Token"));
            }
            return next();
        });

        // Simple logging
        this.server.on("Unauthorized", (req : Request, res : Response, err : Error, cb : Function) => {
            LogAPI.warn(err);
            cb();
        });

        this.registerRoutes();
    }


    private registerRoutes(): void {
        this.server.post("/api/v2/animation/:animationName", (req : Request, res : Response, next : Next) => {
            if (typeof req.body.animation !== "object") {
                return next(new ERRORS.BadRequestError("Bad Body"));
            }

            try {
                let animation = this.animationStore.getAnimation(req.params.animationName.toLowerCase(), req.body.animation);           
                this.animationController.changeAnimation(animation);
            } catch (error) {
                return next(this.parseError(error));
            }

            res.json({"status": 200, "message": "Changed Animation"});
            return next();
        });

        this.server.post("/api/v2/persistent/animation/add/:animationName/:id", (req : Request, res : Response, next : Next) => {
            if (typeof req.body.animation !== "object") {
                return next(new ERRORS.BadRequestError("Bad Body"));
            }

            if (req.params.id === "" || req.params.id === undefined) {
                return next(new ERRORS.BadRequestError("Invalid ID"));
            }

            try {
                let animation = this.animationStore.getAnimation(req.params.animationName.toLowerCase(), req.body.animation);
                this.animationController.addPersistentNotification(req.params.id, animation);          
            } catch (error) {
                return next(this.parseError(error));
            }

            res.json({"status": 200, "message": "Added Persistent Animation"});
            return next();
        });

        this.server.get("/api/v2/persistent/animation/remove/:id", (req : Request, res : Response, next : Next) => {
            if (req.params.id === "" || req.params.id === undefined) {
                return next(new ERRORS.BadRequestError("Invalid ID"));
            }

            this.animationController.removePersistentNotification(req.params.id);

            res.json({"status": 200, "message": "Removed Persistent Animation"});
            return next();
        });

        this.server.get("/api/v2/persistent/animation/clear", (req : Request, res : Response, next : Next) => {
            this.animationController.clearPersistentNotifications();

            res.json({"status": 200, "message": "Cleared Persistent Animations"});
            return next();
        });
        
        this.server.post("/api/v2/persistent/settings/mode", (req : Request, res : Response, next : Next) => {
            if (!(req.body.options && typeof req.body.options.mode === "number" && typeof req.body.options.startLED === "number")) {
                return next(new ERRORS.BadRequestError("Bad Body"));
            }

            this.animationController.changePersistentNotificationsManagerMode(req.body.options.mode, req.body.options.startLED, req.body.options.notificationLength);

            res.contentType = "json";
            res.send({"status": 200, "message": "Updated Persistent Notification Manager"});
            return next();

        });
        
        this.server.post("/api/v2/notification/:notificationName", (req : Request, res : Response, next : Next) => {
            if (typeof req.body.notification !== "object") {
                return next(new ERRORS.BadRequestError("Bad Body"));
            }
            
            try {
                let notification = this.animationStore.getNotification(req.params.notificationName.toLowerCase(), req.body.notification);            
                this.animationController.playNotification(notification);
            } catch (error) {
                return next(this.parseError(error));
            }
        
            res.json({"status": 200, "message": "Added Notification to queue"});
            return next();
        });
        
        this.server.post("/api/v2/start", (req : Request, res : Response, next : Next) => {
            if (typeof req.body.update_per_second !== "number") return next(new ERRORS.BadRequestError("Bad Body"));

            this.animationController.start(req.body.update_per_second);
        
            res.json({"status": 200, "message": "Started animation"});
            return next();
        });
        
        this.server.get("/api/v2/stop", (req : Request, res : Response, next : Next) => {
            this.animationController.stop();
            this.animationController.clearLEDs();
        
            res.json({"status": 200, "message": "Stopped animation"});
            return next();
        });
        
        this.server.get("/api/v2/status", (req : Request, res : Response, next : Next) => {
            // Get the name of the current Animation 
            let currentAnimationName: string = "None";
            if (this.animationController.isRunning()) {
                currentAnimationName = this.animationController.getAnimation().getName();
            }

            res.json({
                "status": 200, 
                "updates_per_second": this.animationController.getUPS(),
                "running": this.animationController.isRunning(),
                "isPlayingNotification": this.animationController.isPlayingNotification,
                "version": this.options.version,
                "uptime": new Date().getTime() - this.uptime,
                "animation": currentAnimationName,
            });
            return next();
        });
    
    }

    private parseError(error: Error) : HttpError {
        if (error instanceof ParameterParsingError) {
            return new ERRORS.BadRequestError(error.message);
        }
        if (error instanceof AnimationNotRunningError) {
            return new ERRORS.ServiceUnavailableError(error.message);
        }
        if (error instanceof AnimationNotFoundError) {
            return new ERRORS.NotFoundError(error.message);
        }
        return new ERRORS.InternalServerError("Something doesn't seem right");
    }

    public listen(cb: ()=>any): void {
        this.server.listen(this.options.port, cb);
    }

    public close(cb: ()=>any): void {
        this.server.close(cb);
    }

}


export interface APIOptions {
    certificate?: string | Buffer | ReadonlyArray<string | Buffer>;
    key?: string | Buffer | ReadonlyArray<string | Buffer>;
    port: number;
    version: string;
    token: string;
}