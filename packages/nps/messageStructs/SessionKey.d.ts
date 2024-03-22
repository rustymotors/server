/// <reference types="node" />
import type { ISerializable } from "../types.js";
export declare class SessionKey implements ISerializable {
    private key;
    private timestamp;
    constructor(key: Buffer, timestamp: number);
    serialize(): Buffer;
    deserialize(data: Buffer): void;
    getByteSize(): number;
    static fromBytes(bytes: Buffer): SessionKey;
    static fromKeyString(key: string): SessionKey;
    getKey(): string;
    toString(): string;
    toHex(): string;
    toBytes(): Buffer;
    getSize(): number;
    getData(): Buffer;
    setData(data: Buffer): void;
}
