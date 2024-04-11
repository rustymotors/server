/// <reference types="node" />
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
export declare class NetworkMessage extends SerializedBuffer {
    private _messageId;
    version: number;
    reserved: number;
    private _checksum;
    constructor(messageId: number, data?: Buffer);
    serialize(): Buffer;
    deserialize(buffer: Buffer): this;
    set data(data: Buffer);
    get messageId(): number;
    get length(): number;
    asHex(): string;
}
