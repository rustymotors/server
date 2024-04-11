/// <reference types="node" />
import type { ISerializable } from "../types.js";
export declare class UserInfo implements ISerializable {
    private profileId;
    private profileName;
    private userData;
    constructor(id: number, name: string);
    serialize(): Buffer;
    deserialize(data: Buffer): void;
    getByteSize(): number;
    toString(): string;
}
