/// <reference types="node" />
import type { ISerializable } from "../types.js";
export declare class UserAction implements ISerializable {
    private name;
    private data;
    constructor(name: string, bytes?: Buffer);
    serialize(): Buffer;
    deserialize(data: Buffer): void;
    getByteSize(): number;
    setData(data: Buffer): void;
    getData(): Buffer;
    static fromBytes(name: string, bytes: Buffer): UserAction;
    toBytes(): Buffer;
    toString(): string;
    toHex(): string;
    getSize(): number;
}
