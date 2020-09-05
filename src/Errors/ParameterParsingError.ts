export class ParameterParsingError extends Error {
    constructor(message) {
        super(message);
        this["code"] = "ParsingError";
        Error.captureStackTrace(this, ParameterParsingError);
    }
}