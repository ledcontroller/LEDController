import {IAnimation} from "../Interfaces/IAnimation";
import {Led} from "../Led";
import {IColor} from "../Interfaces/IColor";
import {ParameterParsingError} from "../Errors/ParameterParsingError";
import {IStripController} from "../Interfaces/IStripController";

interface ISideToSideData {
    ledCount: number,
    duration: number,
    colors: Array<IColor>
}

export class SideToSide implements IAnimation{
    colors: Array<IColor>;
    curColor: number = 0;
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

    update(leds: Array<Led>, strip: IStripController) {

        if (this.direction) {
            for (let i = this.border; i < this.border + this.ledsPerFrame && i <= this.ledcount; i++) {
                strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
            }
            this.percBorder += this.ledsPerFrame;
            this.border = Math.round(this.percBorder);
        } else {
            for (let i = this.border; i > this.border - this.ledsPerFrame && i >= 0; i--) {
                strip.set(i, this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
            }
            this.percBorder -= this.ledsPerFrame;
            this.border = Math.round(this.percBorder);
        }

        if (this.border >= leds.length) {
            this.border = leds.length;
            this.percBorder = leds.length;
            if (++this.curColor >= this.colors.length) this.curColor = 0;
            this.direction = !this.direction
        } else if(this.border <= 0) {
            this.border = 0;
            this.percBorder = 0;
            if (++this.curColor >= this.colors.length) this.curColor = 0;
            this.direction = !this.direction
        }

        strip.sync();
    }
}