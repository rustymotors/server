/// <reference types="node" />
import type { ISerializable } from "../types.js";
import { NPSList } from "./NPSList.js";
export declare class MiniRiffInfo implements ISerializable {
    riffName: string;
    riffId: number;
    population: number;
    constructor(riffName: string, riffId: number, population: number);
    serialize(): Buffer;
    deserialize(data: Buffer): void;
    getByteSize(): number;
    toString(): string;
}
export declare class MiniRiffList extends NPSList implements ISerializable {
    serialize(): Buffer;
    deserialize(data: Buffer): void;
    getByteSize(): number;
    private riffs;
    getMaxRiffs(): number;
    addRiff(riff: MiniRiffInfo): void;
    toBytes(): Buffer;
    toString(): string;
    toHex(): string;
    getSize(): number;
}
