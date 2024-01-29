import { SerializedBuffer } from "./SerializedBuffer.js";

/**
 * A serialized buffer, prefixed with a 2-byte message id and a 2-byte total length.
 */
export class RawMessage extends SerializedBuffer {
    private _messageId: number;
    constructor(messageId: number, data?: Buffer) {
        super(data);
        this._messageId = messageId;
    }
    override serialize() {
        const buffer = Buffer.alloc(4 + this._data.length);
        buffer.writeUInt16BE(this._messageId, 0);
        buffer.writeUInt16BE(this._data.length + 4, 2);
        this._data.copy(buffer, 4);
        return buffer;
    }
    override deserialize(buffer: Buffer) {
        if (buffer.length < 4) {
            throw new Error(
                `Unable to get header from buffer, got ${buffer.length}`,
            );
        }
        const length = buffer.readUInt16BE(2);
        if (buffer.length < length) {
            throw new Error(
                `Expected buffer of length ${length}, got ${buffer.length}`,
            );
        }
        this._messageId = buffer.readUInt16BE(0);
        this._data = buffer.subarray(4, 4 + length);
        return this;
    }

    get messageId(): number {
        return this._messageId;
    }

    override get length(): number {
        return 4 + this._data.length;
    }

    override asHex(): string {
        return this.serialize().toString("hex");
    }
}
