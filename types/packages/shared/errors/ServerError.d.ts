import { BuiltinError } from "../../interfaces/index.js";
/**
 * ServerError
 * @description
 * Error class for server errors
 * @export
 * @class ServerError
 * @extends {Error}
 */
export declare class ServerError extends Error implements BuiltinError {
    code: number;
    constructor(message: string);
    toJSON(): Record<string, unknown>;
    toString(): string;
    static fromJSON(json: Record<string, unknown>): ServerError;
    static fromString(jsonString: string): ServerError;
    static fromError(error: Error): ServerError;
    static fromUnknown(error: unknown): ServerError;
}
//# sourceMappingURL=ServerError.d.ts.map