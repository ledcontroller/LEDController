export class AnimationNotRunningError extends Error {
    constructor(message) {
        super(message);
        Error.captureStackTrace(this, AnimationNotRunningError);
    }
}