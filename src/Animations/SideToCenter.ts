import { IAnimation } from "../Interfaces/IAnimation";
import { Led } from "../Led";
import { IColor } from "../Interfaces/IColor";
import { ParameterParsingError } from "../Errors/ParameterParsingError";
import { IStripController } from "../Interfaces/IStripController";

interface ISideToCenterData {
    ledCount: number,
    duration: number,
    colors: Array<IColor>
}

export class SideToCenter implements IAnimation{
    colors: Array<IColor>;
    curColor: number = 0;
    ledsPerFrame: number;
    border: number = 0;
    percBorder: number = 0;

    constructor(requestParameter: ISideToCenterData) {
        this.colors = requestParameter.colors;
        this.ledsPerFrame = (requestParameter.ledCount * 0.5) / requestParameter.duration;
    
        if (!(this.colors && this.ledsPerFrame)) {
            throw new ParameterParsingError("Wrong parameter provided");
        }
    }

    public update(leds: Array<Led>, strip: IStripController): void {

        // Front
        for (let i = 0; i < this.border; i++) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }
        // Back
        for (let i = leds.length - 1; i > leds.length - this.border; i--) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }

        this.percBorder += this.ledsPerFrame;
        this.border = Math.round(this.percBorder);

        if (this.border > leds.length * 0.5) {

            //Fill Center LEDs too
            strip.all(this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);

            this.border = 0;
            this.percBorder = 0;
            if (++this.curColor >= this.colors.length) this.curColor = 0;
        }

    }

    public getName(): string {
        return "SideToCenter";
    }
}