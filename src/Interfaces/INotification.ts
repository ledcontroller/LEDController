import {IAnimation} from "./IAnimation";

export interface INotification extends IAnimation {
    /**
     * Attaches a done Callback to the Notification
     * @param callback callback to be executed once the notification finished playing
     */
    attachDoneCallback(callback: Function): void;
}