import { IAnimation } from "../Interfaces/IAnimation";
import { Led } from "../Led";
import { IColor } from "../Interfaces/IColor";
import { ParameterParsingError } from "../Errors/ParameterParsingError";

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
    centerLED: number = 0;

    constructor(requestParameter: ISideToCenterData) {
        this.colors = requestParameter.colors;
        this.ledsPerFrame = (requestParameter.ledCount * 0.5) / requestParameter.duration;
        this.centerLED = Math.round(requestParameter.ledCount * 0.5);

        if (!(this.colors && this.ledsPerFrame)) {
            throw new ParameterParsingError("Wrong parameter provided");
        }
    }

    public update(leds: Array<Led>): void {

        // Front
        for (let i = 0; i < this.border; i++) {
            leds[i].color = this.colors[this.curColor];
            //strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }
        // Back
        for (let i = leds.length - 1; i > leds.length - this.border; i--) {
            leds[i].color = this.colors[this.curColor];
            //strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }

        this.percBorder += this.ledsPerFrame;
        this.border = Math.round(this.percBorder);

        if (this.border > this.centerLED) {

            //Fill Center LEDs too
            leds[this.centerLED - 1].color = this.colors[this.curColor];
            leds[this.centerLED].color = this.colors[this.curColor];
            leds[this.centerLED + 1].color = this.colors[this.curColor];

            this.border = 0;
            this.percBorder = 0;
            if (++this.curColor >= this.colors.length) this.curColor = 0;
        }

    }

    public getName(): string {
        return "SideToCenter";
    }

    public onResume(leds: Array<Led>): void {}
}