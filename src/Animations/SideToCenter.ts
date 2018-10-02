import {IAnimation} from "../IAnimation";
import {Led} from "../Led";
import {IColor} from "../IColor";
import { ISideToCenterData } from "../Transferinterfaces/ISideToCenterData";
import {ParameterParsingError} from "../Errors/ParameterParsingError";
import { IStripController } from "../IStripController";

export class SideToCenter implements IAnimation{
    colors: Array<IColor>;
    curColor: number = 0;
    ledsPreFrame: number;
    border: number = 0;

    constructor(requestParameter: ISideToCenterData) {
        this.colors = requestParameter.colors;
        this.ledsPreFrame = Math.round((requestParameter.ledCount * 0.5) / requestParameter.duration);
    
        if (!(this.colors && this.ledsPreFrame)) {
            throw new ParameterParsingError("Wrong parameter provided");
        }
    }

    update(leds: Array<Led>, strip: IStripController) {

        // Front
        for (let i = 0; i < this.border; i++) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }
        // Back
        for (let i = leds.length; i > leds.length - this.border; i--) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }

        this.border += this.ledsPreFrame;

        if (this.border > leds.length * 0.5) {

            //Fill Center LEDs too
            strip.all(this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);

            this.border = 0;
            if (++this.curColor >= this.colors.length) this.curColor = 0;
        }

        strip.sync();
    }
}