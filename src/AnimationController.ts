import { Led } from "./Led";
import { IAnimation } from './Interfaces/IAnimation'
import { INotification } from "./Interfaces/INotification";
import { IStripController } from "./Interfaces/IStripController";
import { Blink } from "./Animations/Blink";
import { IColor } from "./Interfaces/IColor";
import { PersistentNotificationMode, PersistentNotificationsManager } from "./PersistentNotificationsManager";

/**
 * AnimationController handles the playback of Animations and Notifications
 */
export class AnimationController {
    private animation: IAnimation = new Blink({ colors: [{r: 0, g: 255, b: 0, a: 0.2}], duration: 1000});
    private leds: Array<Led> = [];
    private strip: IStripController;1
    private playingNotification: boolean = false;
    private notificationStack: Array<INotification> = [];
    private afterNotificationAnimation: IAnimation;
    private running: boolean = false;
    private stopAfterNotification: boolean = false;
    private ups: number = 30;
    private loop: NodeJS.Timer;
    private persistentAnimationsManager: PersistentNotificationsManager = new PersistentNotificationsManager(70, 5, this.leds, PersistentNotificationMode.RightToLeft);

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
     * Add a Animation as a Notification
     * The Notification will be persistent until it is removed again
     * Animations will be added one after the other 
     * @param id ID to reference this Animation
     * @param animation The Animation to persist as a Notification
     */
    public addPersistentNotification(id: string, animation: IAnimation): void {
        this.persistentAnimationsManager.add(id, animation);
    }

    /**
     * Removes a persistent Animation
     * All subsequent Animations will shift to close possible gaps
     * @param id ID used to add the Animation
     */
    public removePersistentNotification(id: string): void {
        this.persistentAnimationsManager.remove(id);
    }

    /**
     * Removes all Persistent Notifications
     */
    public clearPersistentNotifications(): void {
        this.persistentAnimationsManager.removeAll();
    }

    /**
     * Changes the Mode and sets new start position.
     * Can also change Notification length 
     * @param mode New Mode
     * @param startLED New start position
     * @param notificationLength Optional: new length of Notifications
     */
    public changePersistentNotificationsManagerMode(mode: PersistentNotificationMode, startLED: number, notificationLength?: number) {
        this.persistentAnimationsManager.changeMode(mode, startLED, notificationLength);
    }

    /**
     * Changes the Animation
     * @param animation New Animation ot be played
     * @throws {AnimationNotRunningError} Animation loop must me running
     */
    public changeAnimation(animation: IAnimation): void {
        animation.onInit(this.leds);

        if (this.playingNotification) {
            this.afterNotificationAnimation = animation;
        } else {
            this.animation = animation;
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
                    // Only call resume when animation is active
                    this.animation.onResume(this.leds);
                    this.update();
                }
            }
        });

        notification.onInit(this.leds);
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
        this.animation.update(this.leds, this.afterNotificationAnimation);

        if (!this.playingNotification) this.persistentAnimationsManager.update();

        // sync changes to LEDs
        let color: IColor;
        for (let i = 0; i < this.leds.length; i++) {
            color = this.leds[i].color;
            this.strip.set(i, color.r, color.g, color.b, color.a);
        }

        this.strip.sync();
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