import { IAnimation } from "../Interfaces/IAnimation";
import { Led } from "../Led";
import { IColor } from "../Interfaces/IColor";
import { ParameterParsingError } from "../Errors/ParameterParsingError";

interface ISideToSideData {
    ledCount: number,
    duration: number,
    colors: Array<IColor>
}

export class SideToSide implements IAnimation{
    colors: Array<IColor>;
    curColor: number = 0;
    prefColor: number = 0;
    ledsPerFrame: number;
    direction: boolean = true;
    border: number = 0;
    percBorder: number = 0; // Used to calc LED Speeds below 0
    ledcount: number = 0;

    constructor(requestParameter: ISideToSideData) {
        this.colors = requestParameter.colors;
        this.ledsPerFrame = requestParameter.ledCount / requestParameter.duration;
        this.ledcount = requestParameter.ledCount;

        if (!(this.colors && this.ledsPerFrame)) {
            throw new ParameterParsingError("Wrong parameter provided");
        }
    }

    public update(leds: Array<Led>): void {

        if (this.direction) {
            for (let i = 0; i < this.border; i++) {
                leds[i].color = this.colors[this.curColor];
            }
            for (let i = this.border; i < leds.length; i++) {
                leds[i].color = this.colors[this.prefColor];
            }

            this.percBorder += this.ledsPerFrame;
            this.border = Math.round(this.percBorder);
        } else {
            for (let i = 0; i < this.border; i++) {
                leds[i].color = this.colors[this.prefColor];
            }
            for (let i = this.border; i < leds.length; i++) {
                leds[i].color = this.colors[this.curColor];
            }

            this.percBorder -= this.ledsPerFrame;
            this.border = Math.round(this.percBorder);
        }

        if (this.border >= leds.length || this.border <= 0) {
            if (this.border >= leds.length) {
                this.border = leds.length - 1;
            } else {
                this.border = 0;
            }

            this.percBorder = this.border;
            this.prefColor = this.curColor;
            if (++this.curColor >= this.colors.length) this.curColor = 0;
            this.direction = !this.direction
        }

    }

    public getName(): string {
        return "SideToSide";
    }

    public onResume(leds: Array<Led>): void {}
}