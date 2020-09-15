import { Led } from "../Led";
import { IColor } from "../Interfaces/IColor";
import { INotification } from "../Interfaces/INotification";
import { ParameterParsingError } from "../Errors/ParameterParsingError";

interface ICenterToSideNotificationData {
    duration: number,
    colors: Array<IColor>
}

export class CenterToSideNotification implements INotification{
    private colors: Array<IColor>;
    private curColor: number = 0;
    private ledsPreFrame: number;
    private border: number = 0;
    private centerLED: number = 0;
    private finishCallback: Function;
    private duration: number;

    constructor(requestParameter: ICenterToSideNotificationData) {
        this.colors = requestParameter.colors;
        this.duration = requestParameter.duration;

        if (!(this.colors && this.duration)) {
            throw new ParameterParsingError("Wrong parameter provided");
        }
    }

    public attachDoneCallback(callback: Function): void {
        this.finishCallback = callback;
    }

    public update(leds: Array<Led>): void {

        // Front
        for (let i = this.centerLED; i < this.centerLED + this.border && i < leds.length; i++) {
            leds[i].color = this.colors[this.curColor];
        }
        // Back
        for (let i = this.centerLED; i > this.centerLED - this.border && i > 0; i--) {
            leds[i].color = this.colors[this.curColor];
        }

        this.border += this.ledsPreFrame;

        if (this.border > leds.length * 0.5) {
            this.border = 0;
            if (++this.curColor >= this.colors.length) this.finishCallback();
        }
    }

    public getName(): string {
        return "CenterToSide";
    }

    public onResume(leds: Array<Led>): void {}

    public onInit(leds: Array<Led>): void {
        this.centerLED = Math.round(leds.length * 0.5);
        this.ledsPreFrame = Math.round(this.centerLED / this.duration);
    }
}