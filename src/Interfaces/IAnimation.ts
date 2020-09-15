import {Led} from "../Led";

export interface IAnimation {
    /**
     * Update the Animation
     * @param leds Current LEDs
     * @param animation Current Animation, can be used by notifications to see what the current animation is
     */
    update(leds: Array<Led>, animation: IAnimation): void
    
    /**
     * Get Name of that animation
     */
    getName(): string;

    /**
     * This will be called after a Notification finished playing and the Animation will resume
     */
    onResume(leds: Array<Led>): void;
}