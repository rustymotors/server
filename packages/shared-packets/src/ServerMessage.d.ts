/// <reference types="node" />
import { Serializable } from "./BasePacket.js";
import type { ISerializable, IMessage } from "./interfaces.js";
/**
 *
 */
export declare class ServerMessageHeader
    extends Serializable
    implements ISerializable
{
    private length;
    private signature;
    private sequence;
    private flags;
    getDataOffset(): number;
    getByteSize(): number;
    getLength(): number;
    serialize(): Buffer;
    deserialize(data: Buffer): ServerMessageHeader;
    isValidSignature(): boolean;
    isPayloadEncrypted(): boolean;
    togglePayloadEncryption(): ServerMessageHeader;
}
export declare class ServerMessagePayload
    extends Serializable
    implements ISerializable
{
    private messageId;
    getByteSize(): number;
    serialize(): Buffer;
    deserialize(data: Buffer): ServerMessagePayload;
    getMessageId(): number;
    setMessageId(messageId: number): ServerMessagePayload;
}
export declare class ServerMessage extends Serializable implements IMessage {
    header: ServerMessageHeader;
    data: ServerMessagePayload;
    constructor(messageId: number);
    getDataBuffer(): Buffer;
    setDataBuffer(data: Buffer): ServerMessage;
    /** The message length is the length of the message data, not including the id */
    getByteSize(): number;
    getData(): ISerializable;
    setData(data: ServerMessagePayload): ServerMessage;
    serialize(): Buffer;
    deserialize(data: Buffer): ServerMessage;
}
