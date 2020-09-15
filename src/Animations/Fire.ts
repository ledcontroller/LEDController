import { IAnimation } from "../Interfaces/IAnimation";
import { Led } from "../Led";
import { IColor } from "../Interfaces/IColor";
import { ParameterParsingError } from "../Errors/ParameterParsingError";

interface IFireData {
    minFadeDuration: number,
    maxFadeDuration: number,
    colors: Array<IColor>
}

export class Fire implements IAnimation{
    private colors: Array<IColor>;
    private minFadeDuration: number;
    private maxFadeDuration: number;
    private pixelOntime: Array<number> = [];
    private ledsCopy: Array<Led> = [];

    constructor(requestParameter: IFireData) {
        this.colors = requestParameter.colors;
        this.maxFadeDuration = requestParameter.maxFadeDuration;
        this.minFadeDuration = requestParameter.minFadeDuration;
        
        if (!(this.colors && this.minFadeDuration && this.minFadeDuration)) {
            throw new ParameterParsingError("Wrong parameter provided");
        }
    }

    public update(leds: Array<Led>): void {
        for (let i = 0; i < leds.length; i++) {
            if (this.pixelOntime[i] <= 0) {
                // change color
                this.pixelOntime[i] = Math.round(this.minFadeDuration + (Math.random() * (this.maxFadeDuration - this.minFadeDuration)));
                this.ledsCopy[i].color = this.colors[Math.round(Math.random() * (this.colors.length - 1))]; 
            } else {
                this.pixelOntime[i]--;
            }

            leds[i].color = this.ledsCopy[i].color;
        }
    
    }

    public getName(): string {
        return "Fire";
    }

    public onResume(leds: Array<Led>): void {
        this.ledsCopy = leds.slice();
    }

    public onInit(leds: Array<Led>): void {
        for (let i = 0; i < leds.length; i++) {
            this.pixelOntime.push(0);
        }
        this.ledsCopy = leds.slice();
    }
}