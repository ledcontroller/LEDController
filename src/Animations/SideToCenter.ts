import { IAnimation } from "../Interfaces/IAnimation";
import { Led } from "../Led";
import { IColor } from "../Interfaces/IColor";
import { ParameterParsingError } from "../Errors/ParameterParsingError";

interface ISideToCenterData {
    duration: number,
    colors: Array<IColor>
}

export class SideToCenter implements IAnimation{
    private colors: Array<IColor>;
    private curColor: number = 0;
    private ledsPerFrame: number;
    private border: number = 0;
    private percBorder: number = 0;
    private centerLED: number = 0;
    private duration: number;

    constructor(requestParameter: ISideToCenterData) {
        this.colors = requestParameter.colors;
        this.duration = requestParameter.duration;

        if (!(this.colors && this.duration)) {
            throw new ParameterParsingError("Wrong parameter provided");
        }
    }

    public update(leds: Array<Led>): void {

        // Front
        for (let i = 0; i < this.border; i++) {
            leds[i].color = this.colors[this.curColor];
        }
        // Back
        for (let i = leds.length - 1; i > leds.length - this.border; i--) {
            leds[i].color = this.colors[this.curColor];
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

    public onInit(leds: Array<Led>): void {
        this.centerLED = Math.round(leds.length * 0.5);
        this.ledsPerFrame = (leds.length * 0.5) / this.duration;
    }
}