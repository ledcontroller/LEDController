import {IAnimation} from "../IAnimation";
import {Led} from "../Led";
import {Dotstar} from "dotstar";
import {IColor} from "../IColor";
import {INotification} from "../INotification";
import { IBlinkNotificationData } from "../Transferinterfaces/IBlinkNotificationData";

export class BlinkNotification implements INotification{
    colors: Array<IColor>;
    activeTime: number;
    curColor: number = -1; // first run skips first color
    frameCounter: number = 0;
    finishCallback: Function;

    constructor(requestParameter: IBlinkNotificationData) {
        this.colors = requestParameter.colors;
        this.activeTime = requestParameter.duration;
        this.frameCounter = this.activeTime; // Color gets set at first Update
    
        if (!(this.colors && this.activeTime)) {
            throw new Error("Wrong Parameter");
        }
    }

    attachDoneCallback(callback: Function) {
        this.finishCallback = callback;
    }

    update(leds: Array<Led>, strip: Dotstar) {
        if (++this.frameCounter > this.activeTime) {
            this.frameCounter = 0;
            if (++this.curColor >= this.colors.length) {
                this.finishCallback();
                return;
            }

            strip.all(this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
            strip.sync();
        }
    }
}