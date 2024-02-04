import { type Args, type ErrorMessage, type Result } from ".";

export type Pipe<T> = (input: T) => Result<T>;

export const withPipes = <T>(input: T, args: Args<T>): Result<T> => {
    let messages: Array<string> | undefined;

    for (const pipe of args.filter((arg): arg is Pipe<T> => typeof arg === "function")) {
        const { output, errorMessages } = pipe(input);

        input = output as T;

        if (errorMessages) {
            messages ? messages.push(...errorMessages) : (messages = errorMessages);
        }
    }

    return {
        output: input,
        errorMessages: messages,
    };
};

export const minLength = (
    length: number,
    errorMessage: ErrorMessage = "MinLength",
): Pipe<string> => {
    return (input) => {
        if (input.length > length) {
            return {
                output: input,
            };
        }

        return {
            output: input,
            errorMessages: [errorMessage],
        };
    };
};

export const maxLength = (
    length: number,
    errorMessage: ErrorMessage = "MaxLength",
): Pipe<string> => {
    return (input) => {
        if (input.length < length) {
            return {
                output: input,
            };
        }

        return {
            output: input,
            errorMessages: [errorMessage],
        };
    };
};

export const emailAddress = (errorMessage: ErrorMessage = "EmailAddress"): Pipe<string> => {
    return (input) => {
        return {
            output: input,
            errorMessages: [errorMessage],
        };
    };
};
