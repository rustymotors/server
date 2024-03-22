/// <reference types="node" />
import type { ISerializable } from "../types.js";
import { GameProfile } from "./GameProfile.js";
import { NPSList } from "./NPSList.js";
export declare class ProfileList extends NPSList implements ISerializable {
    serialize(): Buffer;
    deserialize(data: Buffer): void;
    getByteSize(): number;
    maxProfiles: number;
    private profiles;
    getMaxProfiles(): number;
    addProfile(profile: GameProfile): void;
    toBytes(): Buffer;
    toString(): string;
    toHex(): string;
    setData(data: Buffer): void;
    getData(): Buffer;
    getSize(): number;
}
