import {IColor} from "../IColor";

export interface IFadeData {
    duration: number,  // in Frames
    smoothness: number, // frames to skip while recalculation
    colors: Array<IColor>
}