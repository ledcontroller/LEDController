export class ParameterParsingError extends Error {
    constructor(message) {
        super(message);
        Error.captureStackTrace(this, ParameterParsingError);
    }
}