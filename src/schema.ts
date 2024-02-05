import { withPipes, type Pipe } from "./pipe";
import { ValidationError, type Result } from "./result";

export type Schema<T = any> = {
    parse: (input: unknown) => Result<T>;
};

export type Output<T extends Schema> = T extends Schema<infer U> ? U : unknown;

export type Args<T> = Array<Pipe<T> | string>;

export type Resolve<T extends Record<string, Schema>> = {
    [Key in keyof T]: Output<T[Key]>;
};

export const string = (...args: Args<string>): Schema<string> => {
    return {
        parse: (input) => {
            if (typeof input === "string") {
                return withPipes(input, args);
            }

            return {
                output: input,
                errorMessages: args.filter((arg): arg is string => typeof arg === "string"),
            };
        },
    };
};

export const number = (...args: Args<number>): Schema<number> => {
    return {
        parse: (input) => {
            if (typeof input === "number") {
                return withPipes(input, args);
            }

            return {
                output: input,
                errorMessages: args.filter((arg): arg is string => typeof arg === "string"),
            };
        },
    };
};

export const bigint = (...args: Args<bigint>): Schema<bigint> => {
    return {
        parse: (input) => {
            if (typeof input === "bigint") {
                return withPipes(input, args);
            }

            return {
                output: input,
                errorMessages: args.filter((arg): arg is string => typeof arg === "string"),
            };
        },
    };
};

export const boolean = (...args: Args<boolean>): Schema<boolean> => {
    return {
        parse: (input) => {
            if (typeof input === "boolean") {
                return withPipes(input, args);
            }

            return {
                output: input,
                errorMessages: args.filter((arg): arg is string => typeof arg === "string"),
            };
        },
    };
};

export const date = (...args: Args<Date>): Schema<Date> => {
    return {
        parse: (input) => {
            if (input instanceof Date) {
                return withPipes(input, args);
            }

            return {
                output: input,
                errorMessages: args.filter((arg): arg is string => typeof arg === "string"),
            };
        },
    };
};

export const any = (...args: Args<any>): Schema<any> => {
    return {
        parse: (input) => {
            return withPipes(input, args);
        },
    };
};

export const object = <T extends Record<string, Schema>>(
    entries: T,
    ...args: Args<Resolve<T>>
): Schema<Resolve<T>> => {
    return {
        parse: (input) => {
            if (input && typeof input === "object") {
                let messages: Array<string> | undefined;

                for (const [key, schema] of Object.entries(entries)) {
                    const { output, errorMessages } = schema.parse(
                        (input as Record<string, any>)[key],
                    );

                    (input as Record<string, any>)[key] = output;

                    if (errorMessages) {
                        messages ? messages.push(...errorMessages) : (messages = errorMessages);
                    }
                }

                if (messages) {
                    return {
                        output: input as Resolve<T>,
                        errorMessages: messages,
                    };
                }

                return withPipes(input as Resolve<T>, args);
            }

            return {
                output: input,
                errorMessages: args.filter((arg): arg is string => typeof arg === "string"),
            };
        },
    };
};

export const array = <T extends Schema>(
    schema: T,
    ...args: Args<Array<Output<T>>>
): Schema<Array<Output<T>>> => {
    return {
        parse: (input) => {
            if (Array.isArray(input)) {
                const results = input.map((value) => schema.parse(value));

                const outputs = results.flatMap(({ output }) => output);
                const errorMessages = results.flatMap(({ errorMessages }) => errorMessages ?? []);

                if (errorMessages.length > 0) {
                    return {
                        output: outputs,
                        errorMessages: errorMessages,
                    };
                }

                return withPipes(outputs, args);
            }

            return {
                output: input,
                errorMessages: args.filter((arg): arg is string => typeof arg === "string"),
            };
        },
    };
};

export const optional = <T extends Schema>(
    schema: T,
    defaultValue?: T,
): Schema<Output<T> | undefined> => {
    return {
        parse: (input) => {
            if (input === undefined) {
                return {
                    output: input ?? defaultValue,
                };
            }

            return schema.parse(input);
        },
    };
};

export const parse = <T extends Schema>(schema: T, input: unknown): Output<T> => {
    const { output, errorMessages } = schema.parse(input);

    if (errorMessages) {
        throw new ValidationError(errorMessages);
    }

    return output;
};
