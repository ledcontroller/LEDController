import { IAnimation } from "../Interfaces/IAnimation";
import { Led } from "../Led";
import { IColor } from "../Interfaces/IColor";
import { ParameterParsingError } from "../Errors/ParameterParsingError";
import { IStripController } from "../Interfaces/IStripController";

interface ICenterToSideData {
    ledCount: number,
    duration: number,
    colors: Array<IColor>
}

export class CenterToSide implements IAnimation{
    colors: Array<IColor>;
    curColor: number = 0;
    ledsPreFrame: number;
    border: number = 0;
    persBorder: number = 0;
    centerLED: number = 0;
    ledcount: number = 0;

    constructor(requestParameter: ICenterToSideData) {
        this.colors = requestParameter.colors;
        this.centerLED = Math.round(requestParameter.ledCount * 0.5);
        this.ledsPreFrame = this.centerLED / requestParameter.duration;
        this.ledcount = requestParameter.ledCount;

        if (!(this.colors && this.centerLED && this.ledsPreFrame)) {
            throw new ParameterParsingError("Wrong parameter provided");
        }
    }

    public update(leds: Array<Led>, strip: IStripController): void {

        // Front
        for (let i = this.centerLED; i < this.centerLED + this.border && i <= this.ledcount; i++) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }
        // Back
        for (let i = this.centerLED; i > this.centerLED - this.border && i >= 0; i--) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }

        this.persBorder += this.ledsPreFrame;
        this.border = Math.round(this.persBorder);

        if (this.border > leds.length * 0.5) {
            this.border = 0;
            this.persBorder = 0;
            if (++this.curColor >= this.colors.length) this.curColor = 0;
        }

        strip.sync();
    }

    public getName(): string {
        return "CenterToSide";
    }
}