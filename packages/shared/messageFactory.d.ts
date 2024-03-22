/**
 * @module shared/messageFactory
 * @description Holds the base classes for the various message types.
 * The message types are:
 * - LegacyMessage
 * - NPSMessage
 * - ServerMessage
 * - RawMessage
 */
/// <reference types="node" />
/**
 * @module shared/messageFactory
 * @description Holds the base classes for the various message types.
 * The message types are:
 * - LegacyMessage
 * - NPSMessage
 * - ServerMessage
 * - RawMessage
 */
import type { ServerMessageType } from "./types.js";
/**
 * @abstract
 * @property {Buffer} data
 * @property {number} Size
 */
declare class AbstractSerializable {
    internalBuffer: Buffer;
    constructor();
    _doSerialize(): void;
    /**
     * @param {Buffer} _buffer
     * @returns {AbstractSerializable}
     */
    _doDeserialize(_buffer: Buffer): AbstractSerializable;
    get data(): Buffer;
    /**
     * @param {Buffer} buffer
     */
    setBuffer(buffer: Buffer): void;
    /**
     * @returns {number}
     */
    static get Size(): number;
}
/**
 * @param {Buffer} buffer
 * @returns {string}
 */
export declare function deserializeString(buffer: Buffer): string;
/**
 * Serializes a string with length prefix
 * @param {string} string
 * @param {Buffer} targetBuffer
 * @param {number} offset
 * @returns {number}
 */
export declare function serializeString(
    string: string,
    targetBuffer: Buffer,
    offset: number,
): number;
/**
 * Serializes a raw string without length prefix
 * @param {string} string
 * @param {Buffer} targetBuffer
 * @param {number} offset
 * @param {number} length
 * @returns {number}
 */
export declare function serializeStringRaw(
    string: string,
    targetBuffer: Buffer,
    offset: number,
    length: number,
): number;
declare const legacyHeader_base: typeof AbstractSerializable;
/**
 * A legacy header is a 4 byte header with the following fields:
 * - 2 bytes - id
 * - 2 bytes - length
 *
 *
 */
declare class legacyHeader extends legacyHeader_base {
    _size: number;
    id: number;
    length: any;
    constructor();
    /**
     * @param {Buffer} buffer
     */
    _doDeserialize(buffer: Buffer): this;
    _doSerialize(): Buffer;
    toString(): string;
    static get Size(): number;
}
/**
 * A game message header is a 8 byte header with the following fields:
 * - 2 bytes - id
 * - 2 bytes - length
 * - 2 bytes - gameMessageId
 * - 2 bytes - gameMessageLength
 */
export declare class GameMessageHeader extends legacyHeader {
    _gameMessageId: number;
    _gameMessageLength: number;
    constructor(gameMessageId: number);
    size(): number;
    deserialize(buffer: Buffer): this;
    serialize(): Buffer;
}
declare const NPSHeader_base: typeof AbstractSerializable;
/**
 * A nps header is a 12 byte header with the following fields:
 * - 2 bytes - id
 * - 2 bytes - length
 * - 2 bytes - version
 * - 2 bytes - reserved
 * - 4 bytes - checksum
 *
 * @mixin {SerializableMixin}
 */
export declare class NPSHeader extends NPSHeader_base {
    _size: number;
    id: number;
    length: number;
    version: number;
    reserved: number;
    checksum: number;
    constructor();
    /**
     * @param {Buffer} buffer
     * @returns {NPSHeader}
     * @throws {Error} If the buffer is too short
     * @throws {Error} If the buffer is malformed
     */
    _doDeserialize(buffer: Buffer): NPSHeader;
    _doSerialize(): Buffer;
    static size(): number;
    static get Size(): number;
    toString(): string;
}
declare const serverHeader_base: typeof AbstractSerializable;
/**
 * A server header is an 11 byte header with the following fields:
 * - 2 bytes - length
 * - 4 bytes - mcoSig
 * - 4 bytes - sequence
 * - 1 byte - flags
 */
export declare class serverHeader extends serverHeader_base {
    _size: number;
    length: any;
    mcoSig: string;
    sequence: number;
    flags: number;
    constructor();
    size(): number;
    /**
     * @param {Buffer} buffer
     * @returns {serverHeader}
     * @throws {Error} If the buffer is too short
     * @throws {Error} If the buffer is malformed
     */
    _doDeserialize(buffer: Buffer): serverHeader;
    _doSerialize(): Buffer;
    toString(): string;
}
declare const LegacyMessage_base: typeof AbstractSerializable;
/**
 * A legacy message is an older nps message type. It has a 4 byte header. @see {@link legacyHeader}
 *
 * @mixin {SerializableMixin}
 */
export declare class LegacyMessage extends LegacyMessage_base {
    _header: legacyHeader;
    constructor();
    /**
     * @param {Buffer} buffer
     * @returns {LegacyMessage}
     */
    _doDeserialize(buffer: Buffer): LegacyMessage;
    deserialize(buffer: Buffer): LegacyMessage;
    _doSerialize(): Buffer;
    serialize(): Buffer;
    /**
     * @param {Buffer} buffer
     */
    setBuffer(buffer: Buffer): void;
    asJSON(): {
        header: legacyHeader;
        data: string;
    };
    toString(): string;
}
declare const NPSMessage_base: typeof AbstractSerializable;
/**
 * A NPS message is a message that matches version 1.1 of the nps protocol. It has a 12 byte header. @see {@link NPSHeader}
 *
 * @mixin {SerializableMixin}
 */
export declare class NPSMessage extends NPSMessage_base {
    _header: NPSHeader;
    constructor();
    /**
     * @param {Buffer} buffer
     * @returns {NPSMessage}
     */
    _doDeserialize(buffer: Buffer): NPSMessage;
    serialize(): Buffer;
    size(): number;
    toString(): string;
}
declare const SerializedBuffer_base: typeof AbstractSerializable;
/**
 * A raw message is a message that is not parsed into a specific type.
 * It has no header, and is just a serialized buffer.
 *
 * @mixin {SerializableMixin}
 */
export declare class SerializedBuffer extends SerializedBuffer_base {
    constructor();
    /**
     * @param {Buffer} buffer
     * @returns {SerializedBuffer}
     */
    _doDeserialize(buffer: Buffer): SerializedBuffer;
    serialize(): Buffer;
    toString(): string;
    size(): number;
}
export declare class GameMessage extends SerializedBuffer {
    _header: GameMessageHeader;
    _recordData: Buffer;
    constructor(gameMessageId: number);
    setRecordData(buffer: Buffer): void;
    /** @deprecated - Use setRecordData instead */
    setBuffer(buffer: Buffer): void;
    /** @deprecated - Use deserialize instead */
    _doDeserialize(buffer: Buffer): SerializedBuffer;
    deserialize(buffer: Buffer): this;
    /** @deprecated - Use serialize instead */
    _doSerialize(): void;
    serialize(): Buffer;
    toString(): string;
}
/**
 * A list message is a message that contains a list of items of a specific type.
 *
 * @mixin {SerializableMixin}
 */
export declare class ListMessage extends SerializedBuffer {
    _msgNo: number;
    _listCount: number;
    _shouldExpectMoreMessages: boolean;
    _list: SerializedBuffer[];
    constructor();
    /**
     * @param {SerializedBuffer} item
     */
    add(item: SerializedBuffer): void;
    serialize(): Buffer;
    size(): number;
    getFirstItemSize(): number;
    toString(): string;
}
export declare class MessageHeader extends SerializedBuffer {
    _size: number;
    _messageId: number;
    _messageLength: number;
    constructor();
    get messageId(): number;
    get messageLength(): number;
    serializeSizeOf(): number;
    size(): number;
    get id(): number;
    get length(): number;
    /**
     * @param {Buffer} buffer
     * @returns {MessageHeader}
     */
    deserialize(buffer: Buffer): MessageHeader;
    serialize(): Buffer;
    /**
     * @param {Buffer} buffer
     * @returns {MessageHeader}
     */
    _doDeserialize(buffer: Buffer): MessageHeader;
    _doSerialize(): Buffer;
    toString(): string;
}
export declare class MessageBuffer extends SerializedBuffer {
    _header: MessageHeader;
    _buffer: Buffer;
    constructor();
    /**
     * @param {number} id - The ID of the message
     * @param {Buffer} buffer - The buffer to deserialize
     * @returns {MessageBuffer}
     */
    static createGameMessage(id: number, buffer: Buffer): MessageBuffer;
    get messageId(): number;
    get messageLength(): number;
    get data(): Buffer;
    set data(buffer: Buffer);
    /**
     * @param {Buffer} buffer
     */
    set buffer(buffer: Buffer);
    /** @param {Buffer} buffer */
    setBuffer(buffer: Buffer): Buffer;
    get buffer(): Buffer;
    serializeSizeOf(): number;
    /**
     * @param {Buffer} buffer
     * @returns {MessageBuffer}
     */
    deserialize(buffer: Buffer): MessageBuffer;
    serialize(): Buffer;
    toString(): string;
    asJSON(): {
        header: MessageHeader;
        buffer: string;
    };
}
/**
 * A server message is a message that is passed between the server and the client. It has an 11 byte header. @see {@link serverHeader}
 *
 * @mixin {SerializableMixin}
 */
export declare class OldServerMessage
    extends SerializedBuffer
    implements ServerMessageType
{
    _header: serverHeader;
    _msgNo: number;
    constructor();
    size(): number;
    /**
     * @param {Buffer} buffer
     * @returns {OldServerMessage}
     */
    _doDeserialize(buffer: Buffer): OldServerMessage;
    serialize(): Buffer;
    /**
     * @param {Buffer} buffer
     */
    setBuffer(buffer: Buffer): void;
    updateMsgNo(): void;
    toString(): string;
}
export {};
