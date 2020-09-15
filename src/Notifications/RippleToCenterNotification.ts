import { Led } from "../Led";
import { IColor } from "../Interfaces/IColor";
import { INotification } from "../Interfaces/INotification";
import { ParameterParsingError } from "../Errors/ParameterParsingError";
import { IAnimation } from "../Interfaces/IAnimation";

interface IRippleToCenterNotificationData {
    cycleDuration: number,
    cycles: number,
    size: number,
    amount: number,
    color: IColor,
    keepAnimationRunning: boolean
}

export class RippleToCenterNotification implements INotification {
    private color: IColor;
    private cycles: number;
    private centerLED: number;
    private amount: number;
    private doneCallback: Function;
    private curCycle: number = 0;
    private ledsPerFrame: number;
    private border: number = 0;
    private persBorder: number = 0;
    private size: number;
    private keepAnimationRunning: boolean;

    constructor(requestParameter: IRippleToCenterNotificationData) {
        this.color = requestParameter.color;
        this.cycles = requestParameter.cycles || 4;
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
        this.doneCallback();
    }

    public getName(): string {
        return "RippleToCenter";
    }

    public onResume(leds: Array<Led>): void {}

    public onInit(leds: Array<Led>): void {
        this.centerLED = Math.round(leds.length * 0.5);
    }
}