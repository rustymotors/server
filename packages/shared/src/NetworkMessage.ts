import { ServerError } from "../errors/ServerError.js";
import { SerializedBuffer } from "./SerializedBuffer.js";

/**
 * A serialized buffer, with the following fields:
 * - 2-byte message id
 * - 2-byte total length
 * - 2-byte version
 * - 2-byte reserved
 * - 4-byte checksum (which is the size)
 * - data
 */
export class NetworkMessage extends SerializedBuffer {
    private _messageId: number;
    private _version: number = 0x101;
    private _reserved: number = 0x0000;
    private _checksum: number = 0x00000000;
    constructor(messageId: number, data?: Buffer) {
        super(data);
        this._messageId = messageId;
    }
    override serialize() {
        const buffer = Buffer.alloc(12 + this._data.length);
        buffer.writeUInt16BE(this._messageId, 0);
        buffer.writeUInt16BE(this._data.length + 12, 2);
        buffer.writeUInt16BE(this._version, 4);
        buffer.writeUInt16BE(this._reserved, 6);
        buffer.writeUInt32BE(this._data.length + 12, 8);
        this._data.copy(buffer, 12);
        return buffer;
    }
    override deserialize(buffer: Buffer) {
        if (buffer.length < 12) {
            throw new ServerError(
                `Unable to get header from buffer, got ${buffer.length}`,
            );
        }
        const length = buffer.readUInt16BE(2);
        if (buffer.length < length) {
            throw new ServerError(
                `Expected buffer of length ${length}, got ${buffer.length}`,
            );
        }
        this._messageId = buffer.readUInt16BE(0);
        // Skip the length, we already know it
        this._version = buffer.readUInt16BE(4);
        this._reserved = buffer.readUInt16BE(6);
        this._checksum = buffer.readUInt32BE(8);
        this._data = buffer.subarray(4, 4 + length);
        return this;
    }

    override set data(data: Buffer) {
        this._data = Buffer.from(data);
    }

    get messageId(): number {
        return this._messageId;
    }

    override get length(): number {
        return 12 + this._data.length;
    }

    override asHex(): string {
        return this.serialize().toString("hex");
    }
}
