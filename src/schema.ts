import type { Pipe } from "./pipe";
import { ValidationError, createResult, type Result } from "./result";

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
                return createResult(input);
            }

            return createResult(
                input,
                args.filter((arg): arg is string => typeof arg === "string"),
            );
        },
    };
};

export const number = (...args: Args<number>): Schema<number> => {
    return {
        parse: (input) => {
            if (typeof input === "number") {
                return createResult(input);
            }

            return createResult(
                input,
                args.filter((arg): arg is string => typeof arg === "string"),
            );
        },
    };
};

export const bigint = (...args: Args<bigint>): Schema<bigint> => {
    return {
        parse: (input) => {
            if (typeof input === "bigint") {
                return createResult(input);
            }

            return createResult(
                input,
                args.filter((arg): arg is string => typeof arg === "string"),
            );
        },
    };
};

export const boolean = (...args: Args<boolean>): Schema<boolean> => {
    return {
        parse: (input) => {
            if (typeof input === "boolean") {
                return createResult(input);
            }

            return createResult(
                input,
                args.filter((arg): arg is string => typeof arg === "string"),
            );
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
                return Object.entries(entries).reduce((result, [key, schema]) => {
                    const value = (input as Record<string, unknown>)[key];

                    const { output, errorMessages } = schema.parse(value);

                    (result.output as Record<string, any>)[key] = output;
                    result.errorMessages.push(...errorMessages);

                    return result;
                }, createResult(input));
            }

            return createResult(
                input,
                args.filter((arg): arg is string => typeof arg === "string"),
            );
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
                const errorMessages = results.flatMap(({ errorMessages }) => errorMessages);

                return createResult(outputs, errorMessages);
            }

            return createResult(
                input,
                args.filter((arg): arg is string => typeof arg === "string"),
            );
        },
    };
};

export const optional = <T extends Schema>({ parse }: T): Schema<Output<T> | undefined> => {
    return {
        parse,
    };
};

export const parse = <T extends Schema>(schema: T, input: unknown): Output<T> => {
    const { output, errorMessages } = schema.parse(input);

    if (errorMessages.length > 0) {
        throw new ValidationError(errorMessages);
    }

    return output as Output<T>;
};
