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

    constructor(values: { messageCode?: number; messageLength?: number; messageVersion?: number; messageChecksum?: number } = {}) {
        this.messageCode =  values.messageCode ?? 0;
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
        ])

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

export class SerializedBase implements Serialized {
    header: Header | null = null;

    deserialize(buf: Buffer) {
        throw new Error("This method must be implemented by child classes");
    }
    serialize(): Buffer {
        throw new Error("This method must be implemented by child classes");
    }

    sizeOf(): number {
        throw new Error("This method must be implemented by child classes");
    }
}

export class UserStatus extends SerializedBase implements Serialized {
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

export class GetPersonaMapListRequest
    extends SerializedBase
    implements Serialized {}

export class SerializedList extends SerializedBase implements Serialized {}

export class Persona extends SerializedBase implements Serialized {}

export class SessionKey extends SerializedBase implements Serialized {}

export class UserAction extends SerializedBase implements Serialized {}

export class LoginRequestReply extends SerializedBase implements Serialized {
    sessionKey = ""; // 128 chars string
    header: Header;

    constructor(values: { header?: Header, sessionKey?: string } = {}) {        
        super();
        this.header = values.header ?? new Header();
        this.sessionKey = values.sessionKey ?? "";
    }

    serialize() {
        let buf = this.header.serialize();
        buf = Buffer.concat([buf, serializeString(this.sessionKey)]);

        return buf;
    }

    deserialize(buf: Buffer) {
        this.header.deserialize(buf);
        this.sessionKey = deserializeString(buf.subarray(12));
    }

    sizeOf() {
        let size = this.header.sizeOf();
        size += sizeOfString(this.sessionKey);

        return size;
    }
}

export class GameLogin extends SerializedBase implements Serialized {}

export class GameLoginReply extends SerializedBase implements Serialized {}

export class GetPersonaInfoRequest
    extends SerializedBase
    implements Serialized {}

export class UserStatusRequest extends SerializedBase implements Serialized {}

export class AddPersona extends SerializedBase implements Serialized {}

export class Login extends LoginRequestReply implements Serialized {
    v2P82 = false;
    encryptedSessionKey = ""; // encrypted session key
    readonly GAME_CODE = "2176"; // 40 chars string
    v2P187 = false;

    constructor(
        values: {
            header?: Header;
            v2P82?: boolean;
            sessionKey?: string;
            encryptedSessionKey?: string;
            v2P187?: boolean;
        } = {},
    ) {
        super(values);
        this.v2P82 = values.v2P82 ?? false;
        this.encryptedSessionKey = values.encryptedSessionKey ?? ""; // encrypted session key
        this.v2P187 = values.v2P187 ?? false;
    }

    serialize() {
        let buf = super.serialize();
        buf = Buffer.concat([
            buf,
            serializeBool(this.v2P82),
            serializeString(this.encryptedSessionKey),
            serializeString(this.GAME_CODE),
            serializeBool(this.v2P187),
        ]);

        return buf;
    }

    sizeOf() {
        let size = super.sizeOf();
        size += sizeOfBool();
        size += sizeOfString(this.encryptedSessionKey);
        size += sizeOfString(this.GAME_CODE);
        size += sizeOfBool();

        return size;
    }

    deserialize(buf: Buffer) {
        super.deserialize(buf);
        let cursor = super.sizeOf();
        this.v2P82 = deserializeBool(buf.subarray(cursor));
        cursor += sizeOfBool();
        this.encryptedSessionKey = deserializeString(buf.subarray(cursor));
        cursor += sizeOfString(this.encryptedSessionKey);
        cursor += sizeOfString(this.GAME_CODE);
        this.v2P187 = deserializeBool(buf.subarray(cursor));
        cursor += sizeOfBool();
    }
}
