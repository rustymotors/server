/// <reference types="node" />
import type { ISerializable } from "../types.js";
import { SessionKey } from "./SessionKey.js";
import { UserAction } from "./UserAction.js";
export declare class UserStatus implements ISerializable {
    private customerId;
    private personaId;
    private isCacheHit;
    private ban;
    private gag;
    private sessionKey;
    constructor(
        customerId: number,
        personaId: number,
        isCacheHit: boolean,
        ban: UserAction,
        gag: UserAction,
        sessionKey: SessionKey,
    );
    serialize(): Buffer;
    deserialize(data: Buffer): void;
    getByteSize(): number;
    static new(): UserStatus;
    static fromBytes(bytes: Buffer): UserStatus;
    toBytes(): Buffer;
    getSize(): number;
    getCustomerId(): number;
    setCustomerId(customerId: number): void;
    getPersonaId(): number;
    setPersonaId(personaId: number): void;
    getSessionKey(): SessionKey;
    setSessionKey(sessionKey: SessionKey): void;
    setBan(ban: UserAction): void;
    getGag(): UserAction;
    setGag(gag: UserAction): void;
    toString(): string;
    toHex(): string;
    setData(data: Buffer): void;
}
