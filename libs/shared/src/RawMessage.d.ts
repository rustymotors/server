/// <reference types="node" />
import { SerializedBuffer } from "./SerializedBuffer.js";
/**
 * A serialized buffer, prefixed with a 2-byte message id and a 2-byte total length.
 */
export declare class RawMessage extends SerializedBuffer {
    private _messageId;
    constructor(messageId: number, data?: Buffer);
    serialize(): Buffer;
    deserialize(buffer: Buffer): this;
    get messageId(): number;
    get length(): number;
    asHex(): string;
}
