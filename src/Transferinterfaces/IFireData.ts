import {IColor} from "../IColor";

export interface IFireData {
  ledCount: number,  
  minFadeDuration: number,
  maxFadeDuration: number,
  colors: Array<IColor>
}