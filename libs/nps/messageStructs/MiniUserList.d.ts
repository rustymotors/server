/// <reference types="node" />
import type { ISerializable } from "../types.js";
export declare class MiniUserInfo implements ISerializable {
    userId: number;
    userName: string;
    constructor(userId: number, userName: string);
    serialize(): Buffer;
    deserialize(data: Buffer): void;
    getByteSize(): number;
    toString(): string;
}
export declare class MiniUserList implements ISerializable {
    private channelId;
    private channelUsers;
    constructor(channelId: number);
    addChannelUser(user: MiniUserInfo): void;
    serialize(): Buffer;
    deserialize(data: Buffer): void;
    getByteSize(): number;
    toString(): string;
}
