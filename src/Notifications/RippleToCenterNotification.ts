import { Led } from "../Led";
import { IColor } from "../Interfaces/IColor";
import { INotification } from "../Interfaces/INotification";
import { ParameterParsingError } from "../Errors/ParameterParsingError";
import { IAnimation } from "../Interfaces/IAnimation";

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

    public attachDoneCallback(doneCallback: Function): void {
        this.doneCallback = doneCallback;
    }

    public update(led: Array<Led>, animation: IAnimation): void {
        //TODO: Didn't work, need to reimplement
    }

    public getName(): string {
        return "RippleToCenter";
    }

    public onResume(leds: Array<Led>): void {}
}