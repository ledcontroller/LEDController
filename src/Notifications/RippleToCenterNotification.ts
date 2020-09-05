import {Led} from "../Led";
import {IColor} from "../Interfaces/IColor";
import {INotification} from "../Interfaces/INotification";
import {ParameterParsingError} from "../Errors/ParameterParsingError";
import { IStripController } from "../Interfaces/IStripController";
import {IAnimation} from "../Interfaces/IAnimation";

interface IRippleToCenterNotificationData {
    ledCount: number,
    cycleDuration: number,
    cycles: number,
    size: number,
    amount: number,
    color: IColor,
    keepAnimationRunning: boolean
}

export class RippleToCenterNotification implements INotification {
    color: IColor;
    cycles: number;
    centerLED: number;
    amount: number;
    doneCallback: Function;
    curCycle: number = 0;
    ledsPerFrame: number;
    border: number = 0;
    persBorder: number = 0;
    size: number;
    keepAnimationRunning: boolean;

    constructor(requestParameter: IRippleToCenterNotificationData) {
        this.color = requestParameter.color;
        this.cycles = requestParameter.cycles || 4;
        this.centerLED = Math.round(requestParameter.ledCount / 2);
        this.amount = requestParameter.amount || 3;
        this.ledsPerFrame = this.centerLED / requestParameter.cycleDuration;
        this.size = requestParameter.size || 10;
        this.keepAnimationRunning = requestParameter.keepAnimationRunning || false;

        if (this.color === undefined) {
            throw new ParameterParsingError("Wrong parameter provided");
        }
    }

    public attachDoneCallback(doneCallback) {
        this.doneCallback = doneCallback;
    }

    public update(led: Array<Led>, strip: IStripController, animation: IAnimation) {
        if (this.keepAnimationRunning) {
            animation.update(led, strip, animation);
        } else {
            strip.clear();
        }

        let curLed: number = 0;
        let isRipple: boolean = false;
        let curAmount: number = 0;

        for (let i = this.border; i > 0; i--) {
            // Switch leds off after x amount of leds have been lit
            if (++curLed%this.size == 0) {
                isRipple = !isRipple;
                if (curAmount++ == this.amount + 1) break;
            }

            if (isRipple && i < this.centerLED) {
                strip.set(i, this.color.r, this.color.g, this.color.b, this.color.a);
                strip.set(strip.getLength() - i, this.color.r, this.color.g, this.color.b, this.color.a);
            }
        }
        strip.sync();

        this.persBorder += this.ledsPerFrame;
        this.border = Math.round(this.persBorder);

        if (this.border > this.centerLED + this.amount * this.size * 2 - this.size) {
            this.persBorder = this.border = 0;

            if (++this.curCycle == this.cycles) {
                this.doneCallback();
            }
        }
    }
}