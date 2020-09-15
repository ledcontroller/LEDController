import { IAnimation } from "../Interfaces/IAnimation";
import { Led } from "../Led";
import { IColor } from "../Interfaces/IColor";
import { ParameterParsingError } from "../Errors/ParameterParsingError";

interface IFadeData {
    duration: number,  // in Frames
    smoothness: number, // frames to skip while recalculation
    colors: Array<IColor>
}

export class Fade implements IAnimation{
    private colors: Array<IColor>;
    private curColor: number = 0;
    private steps: number = 0;
    private colorSteps: Array<IColor>;
    private curStep: number = 0;
    private smoothness: number;
    private curFrame: number = 0;

    constructor(requestParameter: IFadeData) {
        this.colors = requestParameter.colors;
        this.steps = Math.round(requestParameter.duration / requestParameter.smoothness) || 1; // Atleast 1 step
        this.smoothness = requestParameter.smoothness;
        
        if (!(this.colors && this.steps && this.smoothness)) {
            throw new ParameterParsingError("Wrong parameter provided");
        }

        this.calculateNextColorAndSteps();
    }

    public update(leds: Array<Led>): void {

        if (this.curFrame++ == this.smoothness) {
            this.curFrame = 0;
            this.curStep++;

            if (this.curStep >= this.colorSteps.length) {
                this.calculateNextColorAndSteps();
                this.curStep = 0;
            }
        }

        for (let i = 0; i < leds.length; i++) {
            leds[i].color = this.colorSteps[this.curStep]                 
        }
    }

    private calculateNextColorAndSteps(): void {
        if (++this.curColor >= this.colors.length) this.curColor = 0;
        let cur_Color = this.colors[this.curColor];
        let next_Color = this.colors[this.curColor + 1 >= this.colors.length ? 0 : this.curColor + 1];

        let red = cur_Color.r;
        let green = cur_Color.g;
        let blue = cur_Color.b;
        let alpha = cur_Color.a;

        let red_steps = (next_Color.r - cur_Color.r) / this.steps;
        let green_steps = (next_Color.g - cur_Color.g) / this.steps;
        let blue_steps = (next_Color.b - cur_Color.b) / this.steps;
        let alpha_steps = (next_Color.a - cur_Color.a) / this.steps;

        this.colorSteps = [];
        for (let i = 0; i < this.steps; i++) {
            red += red_steps;
            green += green_steps;
            blue += blue_steps;
            alpha += alpha_steps;
            
            this.colorSteps.push({
                r: red < 0 ? 0 : red > 255 ? 255 : red, 
                g: green < 0 ? 0 : green > 255 ? 255 : green, 
                b: blue < 0 ? 0 : blue > 255 ? 255 : blue, 
                a: alpha
            });
        }
    }

    public getName(): string {
        return "Fade";
    }

    public onResume(leds: Array<Led>): void {}
    public onInit(leds: Array<Led>): void {}
}