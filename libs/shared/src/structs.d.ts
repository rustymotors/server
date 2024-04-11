/// <reference types="node" />
export interface Serialized {
    serialize(): Buffer;
    deserialize(buf: Buffer): void;
    sizeOf(): number;
}
export declare class Header implements Serialized {
    messageCode: number;
    messageLength: number;
    messageVersion: number;
    readonly reserved = 0;
    messageChecksum: number;
    sizeOf(): number;
    clear(): void;
    serialize(): Buffer;
    deserialize(buf: Buffer): void;
}
export declare class SerializedBase implements Serialized {
    protected header: Header | null;
    deserialize(_buff: Buffer): Buffer;
    serialize(): Buffer;
    sizeOf(): number;
}
export declare class UserStatus extends SerializedBase implements Serialized {
    v2P320: number;
    v2P321: number;
    v2P1288: number;
    v2P32: number;
    v2P656: number;
    v2P1292: number;
    v2P341: number;
    v2P1368: number;
    sizeOf(): number;
    serialize(): Buffer;
    deserialize(_buff: Buffer): Buffer;
}
export declare class GetPersonaMapListRequest
    extends SerializedBase
    implements Serialized {}
export declare class SerializedList
    extends SerializedBase
    implements Serialized {}
export declare class Persona extends SerializedBase implements Serialized {}
export declare class SessionKey extends SerializedBase implements Serialized {}
export declare class UserAction extends SerializedBase implements Serialized {}
export declare class LoginRequestReply
    extends SerializedBase
    implements Serialized
{
    sessionKey: string;
    setContext(context: string): void;
    _doSerialize(): Buffer;
    _serializeSizeOf(): number;
}
export declare class GameLogin extends SerializedBase implements Serialized {}
export declare class GameLoginReply
    extends SerializedBase
    implements Serialized {}
export declare class GetPersonaInfoRequest
    extends SerializedBase
    implements Serialized {}
export declare class UserStatusRequest
    extends SerializedBase
    implements Serialized {}
export declare class AddPersona extends SerializedBase implements Serialized {}
export declare class Login extends LoginRequestReply implements Serialized {
    v2P82: boolean;
    encryptedSessionKey: string;
    readonly GAME_CODE = "2176";
    v2P187: boolean;
    serialize(): Buffer;
    serializeSizeOf(): number;
    deserialize(buf: Buffer): Buffer;
}
