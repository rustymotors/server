/// <reference types="node" />
import { BaseSerialized } from "./BaseSerialized.js";
/**
 * A serialized buffer, prefixed with its 2-byte length.
 */
export declare class SerializedBuffer extends BaseSerialized {
    constructor(data?: Buffer);
    serialize(): Buffer;
    deserialize(buffer: Buffer): this;
}
