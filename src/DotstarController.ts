import { IStripController } from "./IStripController";
import { Dotstar, ISpi, IDotstarOptions } from "dotstar";

const DOT = require("dotstar");

/**
 * Controller that takes all calls to a Dotstar-Strip and forwards them to the Library
 */
export class DotstarController implements IStripController {
  
  dotstar: Dotstar;
  
  /**
   * Controller that takes all calls to a Dotstar-Strip and forwards them to the Library
   * @param spi Object that handles SPI communication
   * @param options Length of Strip
   */
  constructor(spi: any, options: any) {
    this.dotstar = new DOT.Dotstar(spi, options);
  }

  /**
   * Sets the whole strip
   * @param r Red
   * @param g Green
   * @param b Blue
   * @param a Alpha
   */
  all(r: number, g: number, b: number, a: number): void {
    this.dotstar.all(r, g, b, a);
  }
  /**
   * Sets a specific LED
   * @param led Index of LED
   * @param r Red
   * @param g Green
   * @param b Blue
   * @param a Alpha
   */
  set(led: number, r: number, g: number, b: number, a: number): void {
    this.dotstar.set(led, r, g, b, a);
  }
  /**
   * Applies changes to LED-Strip
   */
  sync(): void {
    this.dotstar.sync();
  }
  /**
   * Clears color buffer (all off)
   */
  clear(): void {
    this.dotstar.clear();
  }
  /**
   * Clears the LED-Strip while retaining the colors in buffer
   * kinda like pausing the LEDs
   */
  off(): void {
    this.dotstar.off();
  }
  /**
   * Returns the length of the LED-Strip
   * @returns {number} Length of LED-Strip
   */
  getLength(): number {
    return this.dotstar.length;
  }
}