import {Led} from "../Led";
import {IColor} from "../IColor";
import {INotification} from "../INotification";
import {ParameterParsingError} from "../Errors/ParameterParsingError";
import { IStripController } from "../IStripController";

interface IBlinkNotificationData {
    duration: number,
    colors: Array<IColor>;
}

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
            throw new ParameterParsingError("Wrong parameter provided");
        }
    }

    attachDoneCallback(callback: Function) {
        this.finishCallback = callback;
    }

    update(leds: Array<Led>, strip: IStripController) {
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