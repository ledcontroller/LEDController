import { IAnimation } from "../Interfaces/IAnimation";
import { Led } from "../Led";
import { IColor } from "../Interfaces/IColor";
import { ParameterParsingError } from "../Errors/ParameterParsingError";

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
        this.frameCounter = 0;

        if (!(this.colors && this.activeTime)) {
            throw new ParameterParsingError("Wrong parameter provided");
        }
    }

    public update(leds: Array<Led>): void {
        for (let i = 0; i < leds.length; i++) {
            leds[i].color = this.colors[this.curColor];
        }
        
        if (++this.frameCounter > this.activeTime) {
            this.frameCounter = 0;
            if (++this.curColor >= this.colors.length) this.curColor = 0;
        }
    }

    public getName(): string {
        return "Blink";
    }

    public onResume(leds: Array<Led>): void {}
}