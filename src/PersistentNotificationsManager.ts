import { IAnimation } from "./Interfaces/IAnimation";
import { Led } from "./Led";
import { StationaryAnimation } from "./StationaryAnimation";

export class PersistentNotificationsManager {
    private stationaryAnimations: { [id: string]: StationaryAnimation } = {};
    private stationaryAnimationsOrdered: Array<StationaryAnimation> = [];

    private mode: PersistentNotificationMode = PersistentNotificationMode.LeftToRight;
    private notificationLength: number;
    private nextLED: number;
    private startLED: number;
    private leds: Array<Led>;

    /**
     * Create a new PersistentNotificationsManager
     * Although it is called PersistentNotification it only shows Animations, as Notifications are not Persistent by my definition
     * This is used to sync whats called Notification on Android/IOS with LED-Controller (A Notification on a mobile device is persistent in the Notificationdrawer)
     * So Android/IOS Notifications are not the same as LED-Controller Notifications
     * This confusing naming is persistent (hah get it :)) throughout all my code and only explained here :)
     * @param startLED First LED Animations will start at.
     * @param notificationLength Number of LEDs per Animations
     * @param leds Reference to main LED Array
     */
    constructor(startLED: number, notificationLength: number, leds: Array<Led>, mode?: PersistentNotificationMode) {
        this.nextLED = this.startLED = startLED;
        this.notificationLength = notificationLength;
        this.leds = leds;
        if (mode) {
            this.mode = mode;
        }
    }
    
    /**
     * Adds a new Animation to the PersistentNotifications this will be appended to the last active Animation, or fill a gap
     * @param id ID of the Animation to reference it later
     * @param animation Animation to add
     */
    public add(id: string, animation: IAnimation): void {
        
        if (this.stationaryAnimations.hasOwnProperty(id)) {
            this.stationaryAnimations[id].changeAnimation(animation);
            this.stationaryAnimations[id].onInit(this.leds);
        } else {

            let stationaryAnimation: StationaryAnimation;
            switch (this.mode) {
                case PersistentNotificationMode.LeftToRight:
    
                    stationaryAnimation = new StationaryAnimation(animation, this.nextLED - this.notificationLength + 1, this.nextLED); // +1 because this.nextLED is the first LED and counts towards the length
                    this.nextLED -= this.notificationLength;
                
                break;
                case PersistentNotificationMode.RightToLeft:
                
                    stationaryAnimation = new StationaryAnimation(animation, this.nextLED, this.nextLED + this.notificationLength - 1); // -1 because this.nextLED is the first LED and counts towards the length
                    this.nextLED += this.notificationLength;
                
                break;
            }

            stationaryAnimation.onInit(this.leds);
            this.stationaryAnimations[id] = stationaryAnimation;
            this.stationaryAnimationsOrdered.push(stationaryAnimation);
        }

    }

    /**
     * Removes an Animation from the PersistentNotifications
     * Subsequent Animations will shift backwards
     * @param id ID of the Animation to remove
     */
    public remove(id: string): void {
        
        if (this.stationaryAnimations.hasOwnProperty(id)) {
            let stationaryAnimation = this.stationaryAnimations[id]; 
            let animationIndex = this.stationaryAnimationsOrdered.findIndex(statAnim => statAnim === stationaryAnimation);

            switch (this.mode) {
                case PersistentNotificationMode.LeftToRight:

                    for (let i = 1 + animationIndex; i < this.stationaryAnimationsOrdered.length; i++) {
                        this.stationaryAnimationsOrdered[i].translatePosition(this.notificationLength);
                        // No change to length, so we don't need to recall init
                    }
                    this.nextLED += this.notificationLength;

                break;
                case PersistentNotificationMode.RightToLeft:
                    
                    for (let i = 1 + animationIndex; i < this.stationaryAnimationsOrdered.length; i++) {
                        // shifting by - 
                        this.stationaryAnimationsOrdered[i].translatePosition(-this.notificationLength);
                        // No change to length, so we don't need to recall init
                    }
                    this.nextLED -= this.notificationLength;
                
                break;
            }

            this.stationaryAnimationsOrdered.splice(animationIndex, 1); // remove animation
            delete this.stationaryAnimations[id]; // remove animation
        }

    }

    /**
     * Remove all Animations
     */
    public removeAll(): void {
        this.stationaryAnimationsOrdered = [];
        this.stationaryAnimations = {};
        this.nextLED = this.startLED;
    }

    /**
     * Updates all PersistentNotifications and writes changes back to provided LED Array
     * @param leds Reference to Orignal LEDs
     */
    public update(): void {
        for (const id in this.stationaryAnimations) {
            this.stationaryAnimations[id].update(this.leds);
        }
    }
}

export enum PersistentNotificationMode {
    LeftToRight,
    RightToLeft,
    Center
}
