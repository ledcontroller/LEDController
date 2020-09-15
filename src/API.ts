import { AnimationController } from "./AnimationController";
import { Server } from "restify";
import { ParameterParsingError } from "./Errors/ParameterParsingError";
import { AnimationNotRunningError } from "./Errors/AnimationNotRunningError";
import { AnimationStore } from "./AnimationStore";
import { AnimationNotFoundError } from "./Errors/AnimationNotFoundError";

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
        this.options = options;
        this.uptime = new Date().getTime();
        this.animationStore = AnimationStore.getInstance();

        this.registerRoutes();
    }


    private registerRoutes(): void {
        // Check if the token is used in basic authorization as password for user "token"
        this.server.use(RSF.plugins.authorizationParser());
        this.server.use((req, res, next) => {
            // Skip for status
            // if (req.getPath().endsWith("/status")) return next();
            if (req.username !== "token" || req.authorization.basic.password !== this.options.token) {
                return next(new ERRORS.UnauthorizedError("Wrong Token"));
            }
            return next();
        });

        // Simple logging
        this.server.on("Unauthorized", (req, res, err, cb) => {
            console.error(err);
            cb();
        });

        this.server.post("/api/v1/animations/*", (req, res, next) => {
            let path = req.getPath();
            let animationName = req.url.split(path.substring(0, path.lastIndexOf('/') + 1))[1];
            let parameters = req.body.animation;

            if (!parameters) {
                return next(new ERRORS.BadRequestError("Bad Body"));
            }

            try {
                let animation = this.animationStore.getAnimation(animationName, parameters);           
                this.animationController.changeAnimation(animation);
            } catch (error) {
                if (error instanceof ParameterParsingError) {
                    return next(new ERRORS.BadRequestError(error.message));
                }
                if (error instanceof AnimationNotRunningError) {
                    return next(new ERRORS.ServiceUnavailableError(error.message));
                }
                if (error instanceof AnimationNotFoundError) {
                    return next(new ERRORS.NotFoundError(error.message));
                }
                return next(new ERRORS.InternalServerError("Something doesn't seem right"));
            }

            res.contentType = "json";
            res.send({"status": 200, "message": "Changed Animation"});
            return next();
        });
        
        this.server.post("/api/v1/notification/", (req, res, next) => {
        
            if (!req.body.notifications) {
                return next(new ERRORS.BadRequestError("Bad Body"));
            }

            for(let notification of req.body.notifications) {
        
                //Get Animation Class and Initialize with Parameters from Request
                if (!notification.parameters) {
                    return next(new ERRORS.BadRequestError("No Parameters provided"));
                }
                try {
                    let notif = this.animationStore.getNotification(notification.effect, notification.parameters)
                    this.animationController.playNotification(notif);
                } catch (error) {
                    if (error instanceof ParameterParsingError) {
                        return next(new ERRORS.BadRequestError(error.message))
                    }
                    if (error instanceof AnimationNotFoundError) {
                        return next(new ERRORS.NotFoundError(error.message));
                    }
                    return next(new ERRORS.InternalServerError("Something doesn't seem right"));
                }

            }
        
            res.contentType = "json";
            res.send({"status": 200, "message": "Added Notifications to queue"});
            return next();
        });
        
        this.server.post("/api/v1/notifications/*", (req, res, next) => {
            let path = req.getPath();
            let notificationName = req.url.split(path.substring(0, path.lastIndexOf('/') + 1))[1];
            let parameters = req.body.notification;
            
            if (!parameters) {
                return next(new ERRORS.BadRequestError("Bad Body"));
            }
            
            try {
                let notification = this.animationStore.getNotification(notificationName, parameters);            
                this.animationController.playNotification(notification);
            } catch (error) {
                if (error instanceof ParameterParsingError) {
                    return next(new ERRORS.BadRequestError(error.message))
                }
                if (error instanceof AnimationNotFoundError) {
                    return next(new ERRORS.NotFoundError(error.message));
                }
                return next(new ERRORS.InternalServerError("Something doesn't seem right"));
            }
        
            res.contentType = "json";
            res.send({"status": 200, "message": "Added Notification to queue"});
            return next();
        });
        
        this.server.post("/api/v1/start", (req, res, next) => {
            if (!req.body.update_per_second) return next(new ERRORS.BadRequestError("Wrong or insufficient parameters"));

            this.animationController.start(req.body.update_per_second);
        
            res.contentType = "json";
            res.send({"status": 200, "message": "Started animation"});
            return next();
        });
        
        this.server.get("/api/v1/stop", (req, res, next) => {
            this.animationController.stop();
            this.animationController.clearLEDs();
        
            res.contentType = "json";
            res.send({"status": 200, "message": "Stopped animation"});
            return next();
        });
        
        this.server.get("/api/v1/status", (req, res, next) => {
            res.contentType = "json";
            
            // Get the name of the current Animation 
            let currentAnimationName: string = "None";
            if (this.animationController.isRunning()) {
                currentAnimationName = this.animationController.getAnimation().getName();
            }

            res.send({
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

    listen(cb: Function): void {
        this.server.listen(this.options.port, cb);
    }

    close(cb: ()=>any): void {
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