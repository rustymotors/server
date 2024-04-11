/// <reference types="node" />
import type { ISerializable } from "../types.js";
export declare class GameProfile implements ISerializable {
    customerId: number;
    profileName: string;
    serverId: number;
    createStamp: number;
    lastLoginStamp: number;
    numberGames: number;
    profileId: number;
    isOnline: boolean;
    gamePurchaseStamp: number;
    gameSerialNumber: string;
    timeOnline: number;
    timeInGame: number;
    gameBlob: Buffer;
    personalBlob: Buffer;
    pictureBlob: Buffer;
    dnd: boolean;
    gameStartStamp: number;
    currentKey: string;
    profileLevel: number;
    shardId: number;
    constructor();
    serialize(): Buffer;
    deserialize(data: Buffer): void;
    getByteSize(): number;
    static new(): GameProfile;
    static fromBytes(data: Buffer, size: number): GameProfile;
    toBytes(): Buffer;
    toString(): string;
    toHex(): string;
    setData(data: Buffer): void;
    getData(): Buffer;
    getSize(): number;
}
