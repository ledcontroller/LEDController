import {IAnimation} from "../IAnimation";
import {Led} from "../Led";
import {Dotstar} from "dotstar";
import {IColor} from "../IColor";
import { IFadeData } from "../Transferinterfaces/IFadeData";
import {ParameterParsingError} from "../Errors/ParameterParsingError";

export class Fade implements IAnimation{
    colors: Array<IColor>;
    curColor: number = 0;
    steps: number = 0;
    colorSteps: Array<IColor>;
    curStep: number = 0;
    smoothness: number;
    curFrame: number = 0;

    constructor(requestParameter: IFadeData) {
        this.colors = requestParameter.colors;
        this.steps = Math.round(requestParameter.duration / requestParameter.smoothness);
        this.smoothness = requestParameter.smoothness;
        
        if (!(this.colors && this.steps && this.smoothness)) {
            throw new ParameterParsingError("Wrong parameter provided");
        }

        this.calculateNextColorAndSteps();
    }

    update(leds: Array<Led>, strip: Dotstar) {

        if (this.curFrame == this.smoothness) {
            this.curFrame = 0;
            this.curStep++;

            if (this.curStep >= this.colorSteps.length) {
                this.calculateNextColorAndSteps();
                this.curStep = 0;
            }

            strip.all(this.colorSteps[this.curStep].r, this.colorSteps[this.curStep].g, this.colorSteps[this.curStep].b, this.colorSteps[this.curStep].a);
            strip.sync();
        }
        this.curFrame++;
    }

    calculateNextColorAndSteps() {
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
}