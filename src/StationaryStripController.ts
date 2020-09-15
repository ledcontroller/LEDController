import { IStripController } from "./Interfaces/IStripController";

/**
 * This is a StripController that only accesses a small area of another StripController,
 * thus allowing a simple implementation for Stationary Animations 
 */
export class StationaryStripController implements IStripController {
    private start: number;
    private end: number;
    private length: number;
    private strip: IStripController; 

    constructor(strip: IStripController, start: number, end: number) {
        this.start = start;
        this.end = end;
        this.length = end - start + 1; // because start and end are included in this strip
        this.strip = strip;
    }


    public all(r: number, g: number, b: number, a: number): void {
        for (let i = this.start; i <= this.end; i++) {
            this.strip.set(i, r, g, b, a);
        }
    }

    public set(led: number, r: number, g: number, b: number, a: number): void {
        if (led > this.length) {
            console.warn("Animation trying to set LED out of its bounds");
            return;
        }
        
        this.strip.set(led + this.start, r, g, b, a);
    }

    public sync(): void {
        console.warn("Don't call sync on StationaryStripController");
    }

    public clear(): void {
        for (let i = this.start; i <= this.end; i++) {
            this.strip.set(i, 0, 0, 0, 0);
        }
    }

    public off(): void {
        console.warn("Don't call off on StationaryStripController");
    }

    public shutdown(callback: Function): void {
        console.warn("Don't call end on StationaryStripController");
    }

    public getLength(): number {
        return this.length;
    }
}