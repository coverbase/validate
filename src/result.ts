export type ErrorMessage = string;

export type Success<T> = {
    output: T;
    errorMessages?: Array<ErrorMessage>;
};

export type Failure = {
    output: unknown;
    errorMessages: Array<ErrorMessage>;
};

export type Result<T> = Success<T> | Failure;

export class ValidationError extends Error {
    readonly errorMessages: Array<ErrorMessage>;

    constructor(errorMessages: Array<ErrorMessage>) {
        super();

        this.errorMessages = errorMessages;
    }
}
