import { IAnimation } from "./Interfaces/IAnimation";
import { Led } from "./Led";

export class StationaryAnimation {

    private animation: IAnimation;
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
    constructor(animation: IAnimation, start: number, end: number) {
        //TODO: Constrain
        this.animation = animation;
        this.start = start;
        this.end = end;

    }

    /**
     * Moves the position of the Animation.
     * !If changing the length call onInit again!
     * @param start First LED for this Animation
     * @param end Last LED for this Animation
     */
    public changePosition(start: number, end: number): void {
        //TODO: Constrain
        this.start = start;
        this.end = end;
    }

    /**
     * Shifts the Animations Position
     * @param amount Number of LEDs to shift
     */
    public translatePosition(amount: number): void {
        //TODO: Constrain 
        this.start += amount;
        this.end += amount;
    }

    /**
     * Swapes the Animation
     * !Call onInit() again!
     * @param animation New Animation
     */
    public changeAnimation(animation: IAnimation): void {
        this.animation = animation;
    }

    /**
     * Init the Animation.
     * This will slice the LED Array to the specific portion
     * @param leds LEDs to Animate
     */
    public onInit(leds: Array<Led>): void {
        //TODO: Constrain
        this.animation.onInit(leds.slice(this.start, this.end + 1));
        // onInit should not and can't change LEDs
    }

    /**
     * Update the Animation.
     * This will slice the LED Array to the specific portion
     * @param leds LEDs to Animate
     */
    public update(leds: Array<Led>): void {
        // map leds from whole strip to local animation strip
        // that way animation can access it 0 based
        const portionOfLEDs: Array<Led> = leds.slice(this.start, this.end + 1); // end is exlusive but we are treating it as inclusive
        this.animation.update(portionOfLEDs, this.animation);
        
        // copy back leds into whole strip
        let j = 0;
        for (let i = this.start; i <= this.end; i++) {
            leds[i] = portionOfLEDs[j++];
        }
    }

}