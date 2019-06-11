import {Led} from "./Led";
import { IStripController } from "./IStripController";

export interface IAnimation {
    update(leds: Array<Led>, strip: IStripController, animation: IAnimation)
}