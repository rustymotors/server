import { BaseSerialized } from "./BaseSerialized.js";
import { ServerError } from "../errors/ServerError.js";

/**
 * A serialized buffer, prefixed with its 2-byte length.
 */
export class SerializedBuffer extends BaseSerialized {
    constructor(data?: Buffer) {
        super(data);
    }
    override serialize() {
        try {
            const buffer = Buffer.alloc(2 + this._data.length);
            buffer.writeUInt16BE(this._data.length, 0);
            this._data.copy(buffer, 2);
            return buffer;
        } catch (error) {
            throw ServerError.fromUnknown(error, "Unable to serialize buffer");
        }
    }
    override deserialize(buffer: Buffer) {
        try {
            const length = buffer.readUInt16BE(0);
            if (buffer.length < 2 + length) {
                throw new ServerError(
                    `Expected buffer of length ${2 + length}, got ${
                        buffer.length
                    }`,
                );
            }
            this._data = buffer.subarray(2, 2 + length);
            return this;
        } catch (error) {
            throw ServerError.fromUnknown(
                error,
                "Unable to deserialize buffer",
            );
        }
    }
}
