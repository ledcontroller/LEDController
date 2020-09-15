import { Led } from "../Led";
import { IColor } from "../Interfaces/IColor";
import { INotification } from "../Interfaces/INotification";
import { ParameterParsingError } from "../Errors/ParameterParsingError";

interface IBlinkNotificationData {
    duration: number,
    colors: Array<IColor>;
}

export class BlinkNotification implements INotification{
    private colors: Array<IColor>;
    private activeTime: number;
    private curColor: number = 0;
    private frameCounter: number = 0;
    private finishCallback: Function;

    constructor(requestParameter: IBlinkNotificationData) {
        this.colors = requestParameter.colors;
        this.activeTime = requestParameter.duration;
        this.frameCounter = 0;
    
        if (!(this.colors && this.activeTime)) {
            throw new ParameterParsingError("Wrong parameter provided");
        }
    }

    public attachDoneCallback(callback: Function): void {
        this.finishCallback = callback;
    }

    public update(leds: Array<Led>): void {
        for (let i = 0; i < leds.length; i++) {
            leds[i].color = this.colors[this.curColor];
        }

        if (++this.frameCounter > this.activeTime) {
            this.frameCounter = 0;
            if (++this.curColor >= this.colors.length) {
                this.finishCallback();
                return;
            }
        }
    }

    public getName(): string {
        return "Blink";
    }

    public onResume(leds: Array<Led>): void {}
    public onInit(leds: Array<Led>): void {}
}