import { IAnimation } from "./Interfaces/IAnimation";
import { IStripController } from "./Interfaces/IStripController";
import { Led } from "./Led";
import { StationaryStripController } from "./StationaryStripController";

export class StationaryAnimation {

    private strip: IStripController;
    private animation: IAnimation;
    private ledRef: Array<Led>;
    private start: number;
    private end: number;

    constructor(animation: IAnimation, start: number, end: number, hardwareStrip: IStripController, leds: Array<Led>) {
    
        this.strip = new StationaryStripController(hardwareStrip, start, end);
        this.animation = animation;
        this.ledRef = leds;
        this.start = start;
        this.end = end;

    }

    public update(): void {
        // map leds from whole strip to local animation strip
        // that way animation can access it 0 based
        const leds: Array<Led> = this.ledRef.slice(this.start, this.end + 1); // end is exlusive but we are treating it as inclusive
        this.animation.update(leds, this.animation);
        
        // copy back leds into whole strip
        let j = 0;
        for (let i = this.start; i <= this.end; i++) {
            this.ledRef[i] = leds[j++];
        }
    }

}