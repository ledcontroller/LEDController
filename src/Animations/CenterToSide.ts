import {IAnimation} from "../IAnimation";
import {Led} from "../Led";
import {Dotstar} from "dotstar";
import {IColor} from "../IColor";
import { ICenterToSideData } from "../Transferinterfaces/ICenterToSideData";

export class CenterToSide implements IAnimation{
    colors: Array<IColor>;
    curColor: number = 0;
    ledsPreFrame: number;
    border: number = 0;
    centerLED: number = 0;
    ledcount: number = 0;

    constructor(requestParameter: ICenterToSideData) {
        this.colors = requestParameter.colors;
        this.centerLED = Math.round(requestParameter.ledCount * 0.5);
        this.ledsPreFrame = Math.round(this.centerLED / requestParameter.duration);
        this.ledcount = requestParameter.ledCount;

        if (!(this.colors && this.centerLED && this.ledsPreFrame)) {
            throw new Error("Wrong Parameter");
        }
    }

    update(leds: Array<Led>, strip: Dotstar) {

        // Front
        for (let i = this.centerLED; i < this.centerLED + this.border && i <= this.ledcount; i++) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }
        // Back
        for (let i = this.centerLED; i > this.centerLED - this.border && i >= 0; i--) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }

        this.border += this.ledsPreFrame;

        if (this.border > leds.length * 0.5) {
            this.border = 0;
            if (++this.curColor >= this.colors.length) this.curColor = 0;
        }

        strip.sync();
    }
}