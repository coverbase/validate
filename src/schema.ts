export type Output<T> = T extends Schema<infer U> ? U : unknown;

export type Success<T> = {
    output: T;
    errorMessages?: Array<string>;
};

export type Failure = {
    output: unknown;
    errorMessages: Array<string>;
};

export type Schema<T = any> = {
    parse: (input: unknown) => Success<T> | Failure;
};

export type Resolve<T extends Record<string, Schema>> = {
    [Key in keyof T]: Output<T[Key]>;
};

export const string = (errorMessage?: string): Schema<string> => {
    return {
        parse: (input) => {
            if (typeof input === "string") {
                return {
                    output: input,
                };
            }

            return {
                output: input,
                errorMessages: [errorMessage ?? "String"],
            };
        },
    };
};

export const number = (errorMessage?: string): Schema<number> => {
    return {
        parse: (input) => {
            if (typeof input === "number") {
                return {
                    output: input,
                };
            }

            return {
                output: input,
                errorMessages: [errorMessage ?? "Number"],
            };
        },
    };
};

export const bigint = (errorMessage?: string): Schema<bigint> => {
    return {
        parse: (input) => {
            if (typeof input === "bigint") {
                return {
                    output: input,
                };
            }

            return {
                output: input,
                errorMessages: [errorMessage ?? "Bigint"],
            };
        },
    };
};

export const boolean = (errorMessage?: string): Schema<boolean> => {
    return {
        parse: (input) => {
            if (typeof input === "boolean") {
                return {
                    output: input,
                };
            }

            return {
                output: input,
                errorMessages: [errorMessage ?? "Boolean"],
            };
        },
    };
};

export const date = (errorMessage?: string): Schema<Date> => {
    return {
        parse: (input) => {
            if (input instanceof Date) {
                return {
                    output: input,
                };
            }

            return {
                output: input,
                errorMessages: [errorMessage ?? "Date"],
            };
        },
    };
};

export const blob = (errorMessage?: string): Schema<Blob> => {
    return {
        parse: (input) => {
            if (input instanceof Blob) {
                return {
                    output: input,
                };
            }

            return {
                output: input,
                errorMessages: [errorMessage ?? "Blob"],
            };
        },
    };
};

export const file = (errorMessage?: string): Schema<File> => {
    return {
        parse: (input) => {
            if (input instanceof File) {
                return {
                    output: input,
                };
            }

            return {
                output: input,
                errorMessages: [errorMessage ?? "File"],
            };
        },
    };
};

export const any = (): Schema<any> => {
    return {
        parse: (input) => {
            return {
                output: input,
            };
        },
    };
};

export const array = <T extends Schema>(
    schema: T,
    errorMessage?: string,
): Schema<Array<Output<T>>> => {
    return {
        parse: (input) => {
            if (Array.isArray(input)) {
                const results = input.map((value) => schema.parse(value));

                const outputs = results.flatMap(({ output }) => output);
                const errorMessages = results.flatMap(({ errorMessages }) => errorMessages ?? []);

                if (errorMessages.length) {
                    return {
                        output: outputs,
                        errorMessages,
                    };
                }

                return {
                    output: outputs,
                };
            }

            return {
                output: input,
                errorMessages: [errorMessage ?? "Array"],
            };
        },
    };
};

export const object = <T extends Record<string, Schema>>(
    entries: T,
    errorMessage?: string,
): Schema<Resolve<T>> => {
    return {
        parse: (input) => {
            if (typeof input === "object") {
                const messages: Array<string> = [];

                for (const [key, schema] of Object.entries(entries)) {
                    const { output, errorMessages } = schema.parse(
                        (input as Record<string, any>)[key],
                    );

                    (input as Record<string, any>)[key] = output;

                    if (errorMessages) {
                        messages.push(...errorMessages);
                    }
                }

                if (messages.length) {
                    return {
                        output: input,
                        errorMessages: messages,
                    };
                }

                return {
                    output: input as Resolve<T>,
                };
            }

            return {
                output: input,
                errorMessages: [errorMessage ?? "Object"],
            };
        },
    };
};

export const optional = <T extends Schema>(
    schema: T,
    defaultValue?: Output<T>,
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
        throw new Error(errorMessages.join(", "));
    }

    return output;
};
