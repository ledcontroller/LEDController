import {IAnimation} from "../IAnimation";
import {Led} from "../Led";
import {IColor} from "../IColor";
import { IStripController } from "../IStripController";

export class Static implements IAnimation{

    color: IColor;

    constructor(color: IColor) {
        this.color = color;
    }

    update(leds: Array<Led>, strip: IStripController) {
        strip.all(this.color.r, this.color.g, this.color.b, this.color.a);
        strip.sync();
    }
}