import { IAnimation } from "./Interfaces/IAnimation";
import { Led } from "./Led";

export class StationaryAnimation {

    private animation: IAnimation;
    private ledRef: Array<Led>;
    private start: number;
    private end: number;

    /**
     * Creates a new Stationary Animation, wrapping the LEDs passed to the Animation in order to constrain it to a portion of the Strip
     * This will also call onInit with the right LED Array portion
     * @param animation Animation to play
     * @param start First LED for this Animation
     * @param end Last LED for this Animation
     * @param leds Original LED Array
     */
    constructor(animation: IAnimation, start: number, end: number, leds: Array<Led>) {
    
        this.animation = animation;
        this.ledRef = leds;
        this.start = start;
        this.end = end;

        const portionOfLEDs: Array<Led> = this.ledRef.slice(this.start, this.end + 1);
        this.animation.onInit(portionOfLEDs);
        // onInit should not and can't change LEDs
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