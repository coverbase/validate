export type ErrorMessage = string;

export type Result<T> = {
    output: T | unknown;
    errorMessages: Array<ErrorMessage>;
};

export const createResult = <T>(output: T, errorMessages: Array<ErrorMessage> = []): Result<T> => {
    return {
        output,
        errorMessages,
    };
};

export class ValidationError extends Error {
    readonly errorMessages: Array<ErrorMessage>;

    constructor(errorMessages: Array<ErrorMessage>) {
        super();

        this.errorMessages = errorMessages;
    }
}
