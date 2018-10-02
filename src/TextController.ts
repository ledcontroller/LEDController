import { IStripController } from "./IStripController";

export class TextController implements IStripController {
  
  /**
   * Simple example on how to implement any other LED controlling library
   * and I don't realy understand how to define a constructor / it's not possible 
   * And that might even not be worth, as not all LEDs are controlled via SPI
   * @param a just so typescript doesn't complain
   * @param b and i am lazy and don't want to change Application.ts
   */
  constructor(a, b) {
    console.log("StripController");
  }

  all(r: number, g: number, b: number, a: number): void {
    console.log("All %s %s %s", r, g, b);
  }
  set(led: number, r: number, g: number, b: number, a: number): void {
    console.log("Set %s %s %s %s", led, r, g, b); // will be spammed 
  }
  sync(): void {
    //gets spammed
  }
  clear(): void {
    console.log("Clear");
  }
  off(): void {
    console.log("Off");
  }

  getLength(): number {
    return 100
  }
}