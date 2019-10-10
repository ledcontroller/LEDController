import {IColor} from "../IColor";

export interface IRippleToCenterNotificationData {
    ledCount: number,
    cycleDuration: number,
    cycles: number,
    size: number,
    amount: number,
    color: IColor,
    keepAnimationRunning: boolean
}