import {IAnimation} from "../IAnimation";
import {Led} from "../Led";
import {Dotstar} from "dotstar";
import {IColor} from "../IColor";

export class Static implements IAnimation{

    color: IColor;

    constructor(color: IColor) {
        this.color = color;
    }

    update(leds: Array<Led>, strip: Dotstar) {
        strip.all(this.color.r, this.color.g, this.color.b, this.color.a);
        strip.sync();
    }
}