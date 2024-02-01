import { createResult, type ErrorMessage, type Result } from ".";

export type Pipe<T> = (input: T) => Result<T>;

export const emailAddress = (errorMessage: ErrorMessage = ""): Pipe<string> => {
    return (input) => {
        return createResult(input, [errorMessage]);
    };
};
