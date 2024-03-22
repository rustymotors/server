/// <reference types="node" />
import type { ISerializable } from "./interfaces.js";
export declare class Serializable implements ISerializable {
    protected _data: Buffer;
    protected _asHex(bytes: Buffer): string;
    protected _assertEnoughData(data: Buffer, expected: number): void;
    serialize(): Buffer;
    deserialize(data: Buffer): void;
    getByteSize(): number;
    asHexString(): string;
}
export declare class BasePacket extends Serializable implements ISerializable {
    private header;
    serialize(): Buffer;
    deserialize(data: Buffer): void;
    getByteSize(): number;
    asHexString(): string;
}
