import {
    deserializeDWord,
    deserializeWord,
    serializeString,
    serializeDWord,
    sizeOfString,
    serializeBool,
    sizeOfBool,
    deserializeBool,
    deserializeString,
    clamp16,
    clamp32,
    serializeWord,
} from "./serializationHelpers.js";

export interface Serialized {
    serialize(): Buffer;
    deserialize(buf: Buffer): void;
    sizeOf(): number;
}

export class Header implements Serialized {
    protected messageCodeInternal = 0; // 2 bytes
    protected messageInternalLength = 0; // 2 bytes
    protected messageVersionInternal = 0; // 2 bytes
    readonly reserved = 0; // 2 bytes
    protected messageChecksumInternal = 0; // 4 bytes

    constructor(
        values: {
            messageCode?: number;
            messageLength?: number;
            messageVersion?: number;
            messageChecksum?: number;
        } = {},
    ) {
        this.messageCode = values.messageCode ?? 0;
        this.messageLength = values.messageLength ?? 0;
        this.messageVersion = values.messageVersion ?? 0;
        this.messageChecksum = values.messageChecksum ?? 0;
    }

    get messageCode() {
        return this.messageCodeInternal;
    }

    set messageCode(value: number) {
        this.messageCodeInternal = clamp16(value);
    }

    get messageLength() {
        return this.messageInternalLength;
    }

    set messageLength(value: number) {
        this.messageInternalLength = clamp16(value);
    }

    get messageVersion() {
        return this.messageVersionInternal;
    }

    set messageVersion(value: number) {
        this.messageVersionInternal = clamp16(value);
    }

    get messageChecksum() {
        return this.messageChecksumInternal;
    }

    set messageChecksum(value: number) {
        this.messageChecksumInternal = clamp32(value);
    }

    sizeOf() {
        return 12;
    }

    serialize() {
        const buf = Buffer.concat([
            serializeWord(this.messageCode),
            serializeWord(this.messageLength),
            serializeWord(this.messageVersion),
            serializeWord(this.reserved),
            serializeDWord(this.messageChecksum),
        ]);

        buf.writeUInt16BE(this.messageCode, 0);
        buf.writeUInt16BE(this.messageLength, 2);
        buf.writeUInt16BE(this.messageVersion, 4);
        buf.writeUInt16BE(this.reserved, 6);
        buf.writeUInt32BE(this.messageChecksum, 8);

        return buf;
    }

    deserialize(buf: Buffer) {
        this.messageCode = deserializeWord(buf);
        this.messageCode = deserializeWord(buf.subarray(2, 4));
        this.messageVersion = deserializeWord(buf.subarray(4, 6));
        this.messageChecksum = deserializeDWord(buf.subarray(8, 12));
    }
}

export class UserStatus implements Serialized {
    v2P320 = 0; // Customer ID 4 bytes
    v2P321 = 0; // Persona ID 4 bytes
    v2P1288 = 0; // bool, unknown
    v2P32 = 0; // bool, banned (NPS_Serialize)
    v2P656 = 0; // bool, gagged (NPS_Serialize)
    v2P1292 = 0; // Session Key (NPS_Serialize)
    v2P341 = 0; // unknown, 4 bytes
    v2P1368 = 0; // Metrics Id (not used) 64 bytes

    sizeOf(): number {
        throw new Error("Not yet implemented");
    }

    serialize(): Buffer {
        throw new Error("Not yet implemented");
    }

    deserialize(buf: Buffer): void {
        throw new Error("Not yet implemented");
    }
}

export class GetPersonaMapListRequest implements Serialized {
    serialize(): Buffer {
        throw new Error("Method not implemented.");
    }
    deserialize(buf: Buffer): void {
        throw new Error("Method not implemented.");
    }
    sizeOf(): number {
        throw new Error("Method not implemented.");
    }
}

export class SerializedList implements Serialized {
    serialize(): Buffer {
        throw new Error("Method not implemented.");
    }
    deserialize(buf: Buffer): void {
        throw new Error("Method not implemented.");
    }
    sizeOf(): number {
        throw new Error("Method not implemented.");
    }
}

export class Persona implements Serialized {
    serialize(): Buffer {
        throw new Error("Method not implemented.");
    }
    deserialize(buf: Buffer): void {
        throw new Error("Method not implemented.");
    }
    sizeOf(): number {
        throw new Error("Method not implemented.");
    }
}

export class SessionKey implements Serialized {
    serialize(): Buffer {
        throw new Error("Method not implemented.");
    }
    deserialize(buf: Buffer): void {
        throw new Error("Method not implemented.");
    }
    sizeOf(): number {
        throw new Error("Method not implemented.");
    }
}

export class UserAction implements Serialized {
    serialize(): Buffer {
        throw new Error("Method not implemented.");
    }
    deserialize(buf: Buffer): void {
        throw new Error("Method not implemented.");
    }
    sizeOf(): number {
        throw new Error("Method not implemented.");
    }
}

export class LoginRequestReply implements Serialized {
    // This is the tiecket from AuthLogin
    contextId = ""; // 128 chars string
    header: Header;

    constructor(values: { header?: Header; contextId?: string } = {}) {
        this.header = values.header ?? new Header();
        this.contextId = values.contextId ?? "";
    }

    serialize() {
        let buf = this.header.serialize();
        buf = Buffer.concat([buf, serializeString(this.contextId)]);

        return buf;
    }

    deserialize(buf: Buffer) {
        this.header.deserialize(buf);
        this.contextId = deserializeString(buf.subarray(12));
    }

    sizeOf() {
        let size = this.header.sizeOf();
        size += sizeOfString(this.contextId);

        return size;
    }
}

export class GameLogin implements Serialized {
    serialize(): Buffer {
        throw new Error("Method not implemented.");
    }
    deserialize(buf: Buffer): void {
        throw new Error("Method not implemented.");
    }
    sizeOf(): number {
        throw new Error("Method not implemented.");
    }
}

export class GameLoginReply implements Serialized {
    serialize(): Buffer {
        throw new Error("Method not implemented.");
    }
    deserialize(buf: Buffer): void {
        throw new Error("Method not implemented.");
    }
    sizeOf(): number {
        throw new Error("Method not implemented.");
    }
}

export class GetPersonaInfoRequest implements Serialized {
    serialize(): Buffer {
        throw new Error("Method not implemented.");
    }
    deserialize(buf: Buffer): void {
        throw new Error("Method not implemented.");
    }
    sizeOf(): number {
        throw new Error("Method not implemented.");
    }
}

export class UserStatusRequest implements Serialized {
    serialize(): Buffer {
        throw new Error("Method not implemented.");
    }
    deserialize(buf: Buffer): void {
        throw new Error("Method not implemented.");
    }
    sizeOf(): number {
        throw new Error("Method not implemented.");
    }
}

export class AddPersona implements Serialized {
    serialize(): Buffer {
        throw new Error("Method not implemented.");
    }
    deserialize(buf: Buffer): void {
        throw new Error("Method not implemented.");
    }
    sizeOf(): number {
        throw new Error("Method not implemented.");
    }
}

export class Login extends LoginRequestReply implements Serialized {
    banned = false;
    encryptedSessionKey = ""; // encrypted session key
    readonly GAME_CODE = "2176"; // 40 chars string
    gagged = false;

    constructor(
        values: {
            header?: Header;
            banned?: boolean;
            gagged?: boolean;
            contextId?: string;
            encryptedSessionKey?: string;
        } = {},
    ) {
        super(values);
        this.banned = values.banned ?? false;
        this.gagged = values.gagged ?? false;
        this.encryptedSessionKey = values.encryptedSessionKey ?? ""; // encrypted session key
    }

    serialize() {
        let buf = super.serialize();
        buf = Buffer.concat([
            buf,
            serializeBool(this.banned),
            serializeBool(this.gagged),
            serializeString(this.encryptedSessionKey),
            serializeString(this.GAME_CODE),
        ]);

        return buf;
    }

    sizeOf() {
        let size = super.sizeOf();
        size += sizeOfBool();
        size += sizeOfBool();
        size += sizeOfString(this.encryptedSessionKey);
        size += sizeOfString(this.GAME_CODE);

        return size;
    }

    deserialize(buf: Buffer) {
        super.deserialize(buf);
        let cursor = super.sizeOf();
        this.banned = deserializeBool(buf.subarray(cursor));
        cursor += sizeOfBool();
        this.gagged = deserializeBool(buf.subarray(cursor));
        cursor += sizeOfBool();
        this.encryptedSessionKey = deserializeString(buf.subarray(cursor));
        cursor += sizeOfString(this.encryptedSessionKey);
        cursor += sizeOfString(this.GAME_CODE);
    }
}
