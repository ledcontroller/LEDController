import {Led} from "../Led";
import {IStripController} from "./IStripController";

export interface IAnimation {
    /**
     * Update the Animation
     * @param leds Current LEDs
     * @param strip Current Strip
     * @param animation Current Animation, can be used by notifications to see what the current animation is
     */
    update(leds: Array<Led>, strip: IStripController, animation: IAnimation): void
}