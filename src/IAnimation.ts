import {Led} from "./Led";
import {Dotstar} from "dotstar";

export interface IAnimation {
    update(leds: Array<Led>, strip: Dotstar)
}