export class AnimationNotRunningError extends Error {
    constructor(message) {
        super(message);
        this.code = "AnimationNotRunning";
        Error.captureStackTrace(this, AnimationNotRunningError);
    }
}