import { IAnimation } from "../Interfaces/IAnimation";
import { Led } from "../Led";
import { IColor } from "../Interfaces/IColor";
import { ParameterParsingError } from "../Errors/ParameterParsingError";
import { IStripController } from "../Interfaces/IStripController";

interface IBlinkData {
    duration: number,  // in Frames
    colors: Array<IColor>
}

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
            throw new ParameterParsingError("Wrong parameter provided");
        }
    }

    public update(leds: Array<Led>, strip: IStripController): void {
        if (++this.frameCounter > this.activeTime) {
            this.frameCounter = 0;
            if (++this.curColor >= this.colors.length) this.curColor = 0;

            strip.all(this.colors[this.curColor].r, this.colors[this.curColor].g, this.colors[this.curColor].b, this.colors[this.curColor].a);
        }
    }

    public getName(): string {
        return "Blink";
    }
}