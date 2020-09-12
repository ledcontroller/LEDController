import { Led } from "./Led";
import { IAnimation } from './Interfaces/IAnimation'
import { INotification } from "./Interfaces/INotification";
import { IStripController } from "./Interfaces/IStripController";
import { Blink } from "./Animations/Blink";

/**
 * AnimationController handles the playback of Animations and Notifications
 */
export class AnimationController {
    private animation: IAnimation = new Blink({ colors: [{r: 0, g: 255, b: 0, a: 0.2}], duration: 1000});
    private leds: Array<Led> = [];
    private strip: IStripController;
    private playingNotification: boolean = false;
    private notificationStack: Array<INotification> = [];
    private afterNotificationAnimation: IAnimation;
    private running: boolean = false;
    private stopAfterNotification: boolean = false;
    private ups: number = 30;
    private loop: NodeJS.Timer;

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
    public changeAnimation(newAnimation: IAnimation): void {
        if (this.playingNotification) {
            this.afterNotificationAnimation = newAnimation;
        } else {
            this.animation = newAnimation;
        }
    }

    /**
     * Stops the current Animation and plays the specified Notification
     * @param notification Notification to be played
     */
    public playNotification(notification: INotification): void {
        if (this.playingNotification) {
            this.notificationStack.push(notification);
            return;
        }

        this.afterNotificationAnimation = this.animation;
        notification.attachDoneCallback(() => {
            this.animation = this.afterNotificationAnimation;
            this.playingNotification = false;

            // Play next Notification
            if (this.notificationStack.length > 0) {
                this.playNotification(this.notificationStack.shift());
                return;
            } else {
                if (this.stopAfterNotification) {
                    // Restop Loop after notification finished
                    this.stop();
                    this.clearLEDs();
                } else {
                    this.update();
                }
            }
        });
        this.animation = notification;
        this.playingNotification = true;

        // Start Loop for notification
        if (!this.running && !this.stopAfterNotification) {
            this.start(this.ups);
            this.stopAfterNotification = true;
        }
    }

    /**
     * Calls the Animation/Notification update function
     */
    public update() {
        this.animation.update(this.leds, this.strip, this.afterNotificationAnimation);
    }

    /**
     * Starts the Animation loop
     * @param updatesPerSeconde Times the update function will be called per second
     */
    public start(updatesPerSeconde: number): void {
        if (this.running && this.stopAfterNotification) {
            this.stopAfterNotification = false;
        }
        if (!this.running) {
            this.ups = updatesPerSeconde;
            this.loop = global.setInterval(this.update.bind(this), 1000 / updatesPerSeconde);
            this.running = true;
        }
    }

    /**
     * Stops the Animation loop
     */
    public stop(): void {
        clearInterval(this.loop);
        this.running = false;
    }

    /**
     * Clears LED-Strip and clears internal LED-Array
     * All LEDs are set to white
     */
    public clearLEDs(): void {
        this.strip.clear();
        for (let i = 0; i < this.strip.getLength(); i++) {
            this.leds.push(new Led({r: 0, g: 0, b: 0, a: 1}));
        }
        this.strip.sync();
    }
    
    //
    // Getters
    //

    public getAnimation(): IAnimation {
        return this.animation;
    }

    public getUPS(): number {
        return this.ups;
    }

    public isRunning(): boolean {
        return this.running;
    }

    public isPlayingNotification(): boolean {
        return this.playingNotification
    }
}