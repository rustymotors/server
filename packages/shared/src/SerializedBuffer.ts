import { BaseSerialized } from "./BaseSerialized.js";

/**
 * A serialized buffer, prefixed with its 2-byte length.
 */
export class SerializedBuffer extends BaseSerialized {
    override serialize() {
        try {
            const buffer = Buffer.alloc(2 + this._data.length);
            buffer.writeUInt16BE(this._data.length, 0);
            this._data.copy(buffer, 2);
            return buffer;
        } catch (error) {
            const err = Error(
                `Error serializing buffer: ${String(error)}`,
            );
            err.cause = error;
            throw err;
        }
    }
    override deserialize(buffer: Buffer): SerializedBuffer {
        try {
            const length = buffer.readUInt16BE(0);
            if (buffer.length < 2 + length) {
                throw Error(
                    `Expected buffer of length ${2 + length}, got ${
                        buffer.length
                    }`,
                );
            }
            this._data = buffer.subarray(2, 2 + length);
            return this;
        } catch (error) {
            const err = Error(
                `Error deserializing buffer: ${String(error)}`,
            );
            err.cause = error;
            throw err;
        }
    }
}
