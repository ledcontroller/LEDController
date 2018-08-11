import {IColor} from "./IColor";

export class Led {
    color: IColor;

    constructor(color: IColor) {
        this.color = color;
    }
}