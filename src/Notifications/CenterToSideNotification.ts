import {IAnimation} from "../IAnimation";
import {Led} from "../Led";
import {Dotstar} from "dotstar";
import {IColor} from "../IColor";
import {INotification} from "../INotification";
import { ICenterToSideNotificationData } from "../Transferinterfaces/ICenterToSideNotificationData";

export class CenterToSideNotification implements INotification{
    colors: Array<IColor>;
    curColor: number = 0;
    ledsPreFrame: number;
    border: number = 0;
    centerLED: number = 0;
    finishCallback: Function;

    constructor(requestParameter: ICenterToSideNotificationData) {
        this.colors = requestParameter.colors;
        this.centerLED = Math.round(requestParameter.ledCount * 0.5);
        this.ledsPreFrame = Math.round(this.centerLED / requestParameter.duration);

        if (!(this.colors && this.centerLED && this.ledsPreFrame)) {
            throw new Error("Wrong Parameter");
        }
    }

    attachDoneCallback(callback) {
        this.finishCallback = callback;
    }

    update(leds: Array<Led>, strip: Dotstar) {

        // Front
        for (let i = this.centerLED; i < this.centerLED + this.border; i++) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }
        // Back
        for (let i = this.centerLED; i > this.centerLED - this.border; i--) {
            strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }
        strip.sync();

        this.border += this.ledsPreFrame;

        if (this.border > leds.length * 0.5) {
            this.border = 0;
            if (++this.curColor >= this.colors.length) this.finishCallback();
        }
    }
}