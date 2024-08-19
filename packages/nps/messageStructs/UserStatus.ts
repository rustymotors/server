import { randomUUID } from "crypto";
import type { ISerializable } from "../types.js";
import { SessionKey } from "./SessionKey.js";
import { UserAction } from "./UserAction.js";

export class UserStatus implements ISerializable {
    private _sessionId: string = "";
    private _remoteIp: string = "";
    private _machineId: string = "";
    private customerId: number = 0;
    private personaId: number = 0;
    private isCacheHit: boolean = false;
    readonly ban: UserAction = new UserAction("ban");
    readonly gag: UserAction = new UserAction("gag");
    private sessionKey: SessionKey = new SessionKey({});

    constructor({
        customerId,
        personaId,
        sessionKey,
    }: {
        customerId: number;
        personaId?: number;
        sessionKey?: SessionKey;

    }) {
        this._sessionId = randomUUID();
        this.customerId = customerId;
        this.personaId = personaId || 0;
        this.isCacheHit = false;
        this.ban = new UserAction("ban");
        this.gag = new UserAction("gag");
        this.sessionKey = sessionKey || new SessionKey({});
    }
    serialize(): Buffer {
        return this.toBytes();
    }
    deserialize(): void {
        throw new Error("Method not implemented.");
    }
    getByteSize(): number {
        return this.getSize();
    }

    getSessionId(): string {
        return this._sessionId;
    }

    getRemoteIp(): string {
        return this._remoteIp;
    }

    setRemoteIp(value: string) {
        if (this._remoteIp !== "" && this._remoteIp !== value) {
            throw new Error("Remote IP is already set and cannot be changed");
        }
        this._remoteIp = value;
    }

    getMachineId(): string {
        return this._machineId;
    }

    setMachineId(value: string) {
        if (this._machineId !== "" && this._machineId !== value) {
            throw new Error("Machine ID is already set and cannot be changed");
        }
        this._machineId = value;
    }

    static new(): UserStatus {
        return new UserStatus({
            customerId: 0,
        });

    }

    static fromBytes(bytes: Buffer): UserStatus {
        let offset = 0;
        const customerId = bytes.readUInt32BE(offset);
        offset += 4;
        const personaId = bytes.readUInt32BE(offset);
        offset += 4;
        // Skip isCacheHit
        offset += 1;
        const ban = UserAction.fromBytes("ban", bytes.subarray(offset));
        offset += ban.getSize();
        const gag = UserAction.fromBytes("gag", bytes.subarray(offset));
        offset += gag.getSize();
        const sessionKey = SessionKey.fromBytes(bytes.subarray(offset));

        return new UserStatus({
            customerId,
            personaId,
            sessionKey,

        });
    }

    toBytes(): Buffer {
        const buffer = Buffer.alloc(this.getSize());

        if (this.sessionKey === null) {
            throw new Error("Session key is required");
        }

        let offset = 0;
        buffer.writeUInt32BE(this.customerId, offset);
        offset += 4;
        buffer.writeUInt32BE(this.personaId, offset);
        offset += 4;
        buffer.writeUInt8(this.isCacheHit ? 1 : 0, offset);
        offset += 1;
        this.ban.toBytes().copy(buffer, offset);
        offset += this.ban.getSize();
        this.gag.toBytes().copy(buffer, offset);
        offset += this.gag.getSize();
        this.sessionKey.toBytes().copy(buffer, offset);
        offset += this.sessionKey.getSize();

        return buffer;
    }

    getSize(): number {
        return (
            4 +
            4 +
            1 +
            this.ban.getSize() +
            this.gag.getSize() +
            this.sessionKey.getSize() +
            4 +
            64
        );
    }

    getCustomerId(): number {
        return this.customerId;
    }

    setCustomerId(customerId: number) {
        this.customerId = customerId;
    }

    getPersonaId(): number {
        return this.personaId;
    }

    setPersonaId(personaId: number) {
        this.personaId = personaId;
    }

    getSessionKey(): SessionKey {
        return this.sessionKey;
    }

    setSessionKey(sessionKey: SessionKey) {
        this.sessionKey = sessionKey;
    }

    toString(): string {
        return `UserStatus:
        Customer ID: ${this.customerId}
        Persona ID: ${this.personaId}
        Is Cache Hit: ${this.isCacheHit}
        Ban: ${this.ban.toString()}
        Gag: ${this.gag.toString()}
        Session Key: ${this.sessionKey.toString()}`;
    }

    toHex(): string {
        return this.toBytes().toString("hex");
    }

    setData() {
        throw new Error("Method not implemented.");
    }
}
