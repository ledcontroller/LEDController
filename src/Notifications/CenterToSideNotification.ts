import { Led } from "../Led";
import { IColor } from "../Interfaces/IColor";
import { INotification } from "../Interfaces/INotification";
import { ParameterParsingError } from "../Errors/ParameterParsingError";
import { IStripController } from "../Interfaces/IStripController";

interface ICenterToSideNotificationData {
    ledCount: number,
    duration: number,
    colors: Array<IColor>
}

export class CenterToSideNotification implements INotification{
    colors: Array<IColor>;
    curColor: number = 0;
    ledsPreFrame: number;
    border: number = 0;
    centerLED: number = 0;
    finishCallback: Function;
    ledCount: number;

    constructor(requestParameter: ICenterToSideNotificationData) {
        this.colors = requestParameter.colors;
        this.centerLED = Math.round(requestParameter.ledCount * 0.5);
        this.ledsPreFrame = Math.round(this.centerLED / requestParameter.duration);
        this.ledCount = requestParameter.ledCount;

        if (!(this.colors && this.centerLED && this.ledsPreFrame)) {
            throw new ParameterParsingError("Wrong parameter provided");
        }
    }

    public attachDoneCallback(callback: Function): void {
        this.finishCallback = callback;
    }

    public update(leds: Array<Led>, strip: IStripController): void {

        // Front
        for (let i = this.centerLED; i < this.centerLED + this.border && i < this.ledCount; i++) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }
        // Back
        for (let i = this.centerLED; i > this.centerLED - this.border && i > 0; i--) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }
        strip.sync();

        this.border += this.ledsPreFrame;

        if (this.border > leds.length * 0.5) {
            this.border = 0;
            if (++this.curColor >= this.colors.length) this.finishCallback();
        }
    }

    public getName(): string {
        return "CenterToSide";
    }
}