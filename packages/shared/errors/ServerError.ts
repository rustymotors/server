import { getServerLogger } from "../log.js";

/**
 * @module errors
 */

/**
 * ServerError
 * Error class for server errors
 * @export
 * @class ServerError
 * @implements {Error}
 * @property {number} code The HTTP status code
 * @property {module:shared/log.ServerLogger} log The logger
 */
export class ServerError extends Error {
    code: number;
    /**
     * Creates an instance of ServerError.
     * @param {string} message The error message
     */
    constructor(message: string) {
        super(message);
        this.code = 500;
        this.name = "ServerError";
    }

    /**
     * Convert the error to JSON
     *
     * @returns {{name: string, message: string, stack: string}}
     */
    toJSON(): { name: string; message: string; stack: string; } {
        return {
            name: this.name,
            message: this.message,
            stack: this.stack ?? "",
        };
    }

    /**
     * Convert the error to a string
     * @override
     */
    override toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * Convert a JSON object to a ServerError
     *
     * @static
     * @param {{
     * name: string,
     * message: string,
     * stack: string
     * }} json The JSON object
     * @returns {ServerError}
     */
    static fromJSON(json: {
            name: string;
            message: string;
            stack: string;
        }): ServerError {
        const { name, message, stack } = json;
        const newError = new ServerError(String(message));
        newError.name = name;
        newError.stack = stack;
        getServerLogger({ level: "error" }).error(json, message);
        return newError;
    }

    /**
     * @static
     * @param {string} jsonString
     * @returns {ServerError}
     */
    static fromString(jsonString: string): ServerError {
        getServerLogger({ level: "error" }).error(jsonString);
        return ServerError.fromJSON(JSON.parse(jsonString));
    }

    /**
     * @static
     * @param {Error} error
     * @returns {ServerError}
     */
    static fromError(error: Error): ServerError {
        const newError = new ServerError(error.message);
        newError.name = error.name;
        newError.stack = error.stack;
        getServerLogger({ level: "error" }).error(error, error.message);
        return newError;
    }

    /**
     * @static
     * @param {unknown} error
     * @param {string} message
     * @returns {ServerError}
     */
    static fromUnknown(error: unknown, message: string): ServerError {
        if (error instanceof Error) {
            return ServerError.fromError(error);
        }
        if (typeof error === "string") {
            return ServerError.fromString(error);
        }
        getServerLogger({ level: "error" }).error(error, message);
        return new ServerError(`Unknown error: ${String(error)}`);
    }
}
