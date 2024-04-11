/// <reference types="node" />
import { SerializedBuffer } from "./SerializedBuffer.js";
declare class HeaderShim {
    private _realObject;
    constructor(realObject: ServerMessage);
    get flags(): number;
    set flags(value: number);
}
/**
 * A serialized buffer, with the following fields:
 * - 2-byte total length
 * - 4-byte signature (TOMC)
 * - 4-byte sequence number
 * - 1-byte flags
 * - data
 */
export declare class ServerMessage extends SerializedBuffer {
    private _signature;
    private _sequence;
    private _flags;
    _header: HeaderShim;
    constructor(sequence?: number, flags?: number, data?: Buffer);
    serialize(): Buffer;
    deserialize(buffer: Buffer): this;
    get data(): Buffer;
    set data(data: Buffer);
    setBuffer(buffer: Buffer): void;
    get length(): number;
    asHex(): string;
    get flags(): number;
    set flags(value: number);
}
export {};
