import { IError } from "./interfaces.js";

/**
 * ServerError
 * @description
 * Error class for server errors
 * @export
 * @class ServerError
 * @extends {Error}
 */
export class ServerError extends Error implements IError {
    code = 500;

    constructor(message: string) {
        super(message);
        this.name = "ServerError";
    }

    public toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            message: this.message,
            stack: this.stack,
        };
    }

    public toString(): string {
        return JSON.stringify(this.toJSON());
    }

    public static fromJSON(json: Record<string, unknown>): ServerError {
        const { name, message, stack } = json;
        const newError = new ServerError(message as string);
        newError.name = name as string;
        newError.stack = stack as string;
        return newError;
    }

    public static fromString(jsonString: string): ServerError {
        return ServerError.fromJSON(JSON.parse(jsonString));
    }

    public static fromError(error: Error): ServerError {
        const newError = new ServerError(error.message);
        newError.name = error.name;
        newError.stack = error.stack;
        return newError;
    }

    public static fromUnknown(error: unknown): ServerError {
        if (error instanceof Error) {
            return ServerError.fromError(error);
        }
        if (typeof error === "string") {
            return ServerError.fromString(error);
        }
        if (typeof error === "object") {
            return ServerError.fromJSON(error as Record<string, unknown>);
        }
        return new ServerError("Unknown error");
    }
}
