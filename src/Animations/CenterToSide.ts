import { IAnimation } from "../Interfaces/IAnimation";
import { Led } from "../Led";
import { IColor } from "../Interfaces/IColor";
import { ParameterParsingError } from "../Errors/ParameterParsingError";

interface ICenterToSideData {
    duration: number,
    colors: Array<IColor>
}

export class CenterToSide implements IAnimation{
    private colors: Array<IColor>;
    private curColor: number = 0;
    private ledsPreFrame: number;
    private border: number = 0;
    private persBorder: number = 0;
    private centerLED: number = 0;
    private duration: number;

    constructor(requestParameter: ICenterToSideData) {
        this.colors = requestParameter.colors;
        this.duration = requestParameter.duration;

        if (!(this.colors && this.duration)) {
            throw new ParameterParsingError("Wrong parameter provided");
        }
    }

    public update(leds: Array<Led>): void {

        // Front
        for (let i = this.centerLED; i < this.centerLED + this.border && i <= leds.length; i++) {
            leds[i].color = this.colors[this.curColor];
        }
        // Back
        for (let i = this.centerLED; i > this.centerLED - this.border && i >= 0; i--) {
            leds[i].color = this.colors[this.curColor];
        }

        this.persBorder += this.ledsPreFrame;
        this.border = Math.round(this.persBorder);

        if (this.border > leds.length * 0.5) {
            this.border = 0;
            this.persBorder = 0;
            if (++this.curColor >= this.colors.length) this.curColor = 0;
        }

    }

    public getName(): string {
        return "CenterToSide";
    }

    public onResume(leds: Array<Led>): void {}

    public onInit(leds: Array<Led>): void {
        this.centerLED = Math.round(leds.length * 0.5);
        this.ledsPreFrame = this.centerLED / this.duration;
    }
}