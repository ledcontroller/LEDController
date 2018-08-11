import {IAnimation} from "../IAnimation";
import {Led} from "../Led";
import {Dotstar} from "dotstar";
import {IColor} from "../IColor";
import {IBlinkData} from "../Transferinterfaces/IBlinkData";

export class Blink implements IAnimation{
    colors: Array<IColor>;
    activeTime: number;
    curColor: number = 0;
    frameCounter: number = 0;

    constructor(requestParameter: IBlinkData) {
        this.colors = requestParameter.colors;
        this.activeTime = requestParameter.duration;
        this.frameCounter = requestParameter.duration; // Color gets set at first Update

        if (!(this.colors && this.activeTime && this.frameCounter)) {
            throw new Error("Wrong Parameter");
        }
    }

    update(leds: Array<Led>, strip: Dotstar) {
        if (++this.frameCounter > this.activeTime) {
            this.frameCounter = 0;
            if (++this.curColor >= this.colors.length) this.curColor = 0;

            strip.all(this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
            strip.sync();
        }
    }
}