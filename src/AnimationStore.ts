import { Blink } from "./Animations/Blink";
import { SideToCenter } from "./Animations/SideToCenter";
import { CenterToSide } from "./Animations/CenterToSide";
import { SideToSide } from "./Animations/SideToSide";
import { Fade } from "./Animations/Fade";
import { Fire } from "./Animations/Fire";
import { BlinkNotification } from "./Notifications/BlinkNotification";
import { CenterToSideNotification } from "./Notifications/CenterToSideNotification";
import { RippleToCenterNotification } from "./Notifications/RippleToCenterNotification";
import { INotification } from "./Interfaces/INotification";
import { IAnimation } from "./Interfaces/IAnimation";
import { AnimationNotFoundError } from "./Errors/AnimationNotFoundError";

export class AnimationStore {

    // Loads the default Animations
    private animations = {
        "blink": Blink,
        "sidetocenter": SideToCenter,
        "centertoside": CenterToSide,
        "sidetoside": SideToSide,
        "fade": Fade,
        "fire": Fire,
    };

    // Loads the default Notifications
    private notifications = {
        "blink": BlinkNotification,
        "centertoside": CenterToSideNotification,
        "rippletocenter": RippleToCenterNotification,
    };

    private static instance: AnimationStore;

    /**
     * Gets and or tries to load the Animation
     * @param name Name of the Animation
     */
    public getAnimation(name: string, params: any): IAnimation {
        if (!this.animations[name]) throw new AnimationNotFoundError("Animation not found");
        return new this.animations[name](params);
    }

    /**
     * Gets and or tries to load the Notification
     * @param name Name of the Notification
     */
    public getNotification(name: string, params: any): INotification {
        if (!this.notifications[name]) throw new AnimationNotFoundError("Notification not found");
        return new this.notifications[name](params);
    }


    public static getInstance(): AnimationStore {
        if (!AnimationStore.instance) {
            AnimationStore.instance = new AnimationStore();
        }
        return AnimationStore.instance;
    }
}