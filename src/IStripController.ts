export interface IStripController {
  all(r: number, g: number, b: number, a: number): void
  set(led: number, r: number, g: number, b: number, a: number): void
  sync(): void
  clear(): void
  off(): void

  shutdown(): void
  getLength(): number
}