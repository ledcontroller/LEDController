import {Led} from "./Led";
import {IAnimation} from './IAnimation'
import {Dotstar} from "dotstar";
import {Static} from "./Animations/Static";
import {INotification} from "./INotification";
import {AnimationNotRunningError} from "./Errors/AnimationNotRunningError";

export class AnimationController {
    animation: IAnimation = new Static({r: 0, g: 255, b: 0, a: 0.2});
    leds: Array<Led> = [];
    strip: Dotstar;
    isPlayingNotification: boolean = false;
    notificationStack: Array<INotification> = [];
    afterNotificationAnimation: IAnimation;
    running: boolean;
    ups: number;
    loop;

    constructor(strip: Dotstar) {
        this.strip = strip;

        // Init LEDs
        for (let i = 0; i < this.strip.length; i++) {
            this.leds.push(new Led({r: 0, g: 0, b: 0, a: 0}));
        }
    }

    changeAnimation(newAnimation: IAnimation): void {
        if (!this.running) throw new AnimationNotRunningError("Animationloop currently not running!");
        if (this.isPlayingNotification) {
            this.afterNotificationAnimation = newAnimation;
        } else {
            this.animation = newAnimation;
        }
    }

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

    update() {
        this.animation.update(this.leds, this.strip);
    }

    start(updatesPerSeconde: number): void {
        if (!this.running) {
            this.ups = updatesPerSeconde;
            this.loop = setInterval(this.update.bind(this), 1000 / updatesPerSeconde);
            this.running = true;
        }
    }

    stopUpdate(): void {
        clearInterval(this.loop);
        this.running = false;
    }

    clearLEDs(): void {
        this.strip.clear();
        for (let i = 0; i < this.strip.length; i++) {
            this.leds.push(new Led({r: 0, g: 0, b: 0, a: 0}));
        }
        this.strip.sync();
    }
}