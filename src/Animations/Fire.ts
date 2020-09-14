import { IAnimation } from "../Interfaces/IAnimation";
import { Led } from "../Led";
import { IColor } from "../Interfaces/IColor";
import { ParameterParsingError } from "../Errors/ParameterParsingError";
import { IStripController } from "../Interfaces/IStripController";

interface IFireData {
    ledCount: number,  
    minFadeDuration: number,
    maxFadeDuration: number,
    colors: Array<IColor>
}

export class Fire implements IAnimation{
    colors: Array<IColor>;
    minFadeDuration: number;
    maxFadeDuration: number;
    pixelOntime: Array<number>;
    ledcount: number;

    constructor(requestParameter: IFireData) {
        this.colors = requestParameter.colors;
        this.maxFadeDuration = requestParameter.maxFadeDuration;
        this.minFadeDuration = requestParameter.minFadeDuration;
        this.ledcount = requestParameter.ledCount;

        this.pixelOntime = new Array()
        for (let i = 0; i < this.ledcount; i++) {
            this.pixelOntime.push(0);
        }
        
        if (!(this.colors && this.minFadeDuration && this.minFadeDuration)) {
            throw new ParameterParsingError("Wrong parameter provided");
        }
    }

    public update(leds: Array<Led>, strip: IStripController): void {
        for (let i = 0; i < this.ledcount; i++) {
            if (this.pixelOntime[i] <= 0) {
                // change color
                this.pixelOntime[i] = Math.round(this.minFadeDuration + (Math.random() * (this.maxFadeDuration - this.minFadeDuration)));

                let color : IColor = this.colors[Math.round(Math.random() * (this.colors.length - 1))]
                leds[i].color = color;

                strip.set(i, color.r, color.g, color.b, color.a);
            } else {
                this.pixelOntime[i]--;
            }
        }
    
    }

    public getName(): string {
        return "Fire";
    }
}