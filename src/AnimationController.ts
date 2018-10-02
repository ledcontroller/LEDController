import {Led} from "./Led";
import {IAnimation} from './IAnimation'
import {Static} from "./Animations/Static";
import {INotification} from "./INotification";
import {AnimationNotRunningError} from "./Errors/AnimationNotRunningError";
import { IStripController } from "./IStripController";
import { Blink } from "./Animations/Blink";

/**
 * AnimationController handles the playback of Animations and Notifications
 */
export class AnimationController {
    animation: IAnimation = new Blink({ colors: [{r: 0, g: 255, b: 0, a: 0.2}], duration: 1000});
    leds: Array<Led> = [];
    strip: IStripController;
    isPlayingNotification: boolean = false;
    notificationStack: Array<INotification> = [];
    afterNotificationAnimation: IAnimation;
    running: boolean;
    ups: number;
    loop;

    /**
     * AnimationController handles the playback of Animations and Notifications
     * @param strip Strip Controller
     */
    constructor(strip: IStripController) {
        this.strip = strip;

        // Init LEDs
        for (let i = 0; i < this.strip.getLength(); i++) {
            this.leds.push(new Led({r: 0, g: 0, b: 0, a: 0}));
        }
    }

    /**
     * Changes the Animation
     * @param newAnimation New Animation ot be played
     * @throws {AnimationNotRunningError} Animation loop must me running
     */
    changeAnimation(newAnimation: IAnimation): void {
        if (!this.running) throw new AnimationNotRunningError("Animationloop currently not running!");
        if (this.isPlayingNotification) {
            this.afterNotificationAnimation = newAnimation;
        } else {
            this.animation = newAnimation;
        }
    }

    /**
     * Stops the current Animation and plays the specified Notification
     * @param notification Notification to be played
     */
    playNotification(notification: INotification): void {
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
            } else {
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
        this.animation.update(this.leds, this.strip);
    }

    /**
     * Starts the Animation loop
     * @param updatesPerSeconde Times the update function will be called per second
     */
    start(updatesPerSeconde: number): void {
        if (!this.running) {
            this.ups = updatesPerSeconde;
            this.loop = setInterval(this.update.bind(this), 1000 / updatesPerSeconde);
            this.running = true;
        }
    }

    /**
     * Stops the Animation loop
     */
    stopUpdate(): void {
        clearInterval(this.loop);
        this.running = false;
    }

    /**
     * Clears LED-Strip and clears internal LED-Array
     * All LEDs are set to white
     */
    clearLEDs(): void {
        this.strip.clear();
        for (let i = 0; i < this.strip.getLength(); i++) {
            this.leds.push(new Led({r: 0, g: 0, b: 0, a: 1}));
        }
        this.strip.sync();
    }
}