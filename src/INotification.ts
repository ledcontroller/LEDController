import {IAnimation} from "./IAnimation";

export interface INotification extends IAnimation {
    attachDoneCallback(callback: Function);
}