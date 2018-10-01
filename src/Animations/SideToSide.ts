import {IAnimation} from "../IAnimation";
import {Led} from "../Led";
import {Dotstar} from "dotstar";
import {IColor} from "../IColor";
import { ISideToSideData } from "../Transferinterfaces/ISideToSideData";
import {ParameterParsingError} from "../Errors/ParameterParsingError";

export class SideToSide implements IAnimation{
    colors: Array<IColor>;
    curColor: number = 0;
    ledsPreFrame: number;
    direction: boolean = true;
    border: number = 0;
    ledcount: number = 0;

    constructor(requestParameter: ISideToSideData) {
        this.colors = requestParameter.colors;
        this.ledsPreFrame = Math.round(requestParameter.ledCount / requestParameter.duration);
        this.ledcount = requestParameter.ledCount;

        if (!(this.colors && this.ledsPreFrame)) {
            throw new ParameterParsingError("Wrong parameter provided");
        }
    }

    update(leds: Array<Led>, strip: Dotstar) {

        if (this.direction) {
            for (let i = this.border; i < this.border + this.ledsPreFrame && i <= this.ledcount; i++) {
                strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
            }
            this.border += this.ledsPreFrame;
        } else {
            for (let i = this.border; i > this.border - this.ledsPreFrame && i >= 0; i--) {
                strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
            }
            this.border -= this.ledsPreFrame;
        }

        if (this.border >= leds.length) {
            this.border = leds.length;
            if (++this.curColor >= this.colors.length) this.curColor = 0;
            this.direction = !this.direction
        } else if(this.border <= 0) {
            this.border = 0;
            if (++this.curColor >= this.colors.length) this.curColor = 0;
            this.direction = !this.direction
        }

        strip.sync();
    }
}