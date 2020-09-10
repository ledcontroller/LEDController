export class AnimationNotFoundError extends Error {
    constructor(message) {
        super(message);
        Error.captureStackTrace(this, AnimationNotFoundError);
    }
}