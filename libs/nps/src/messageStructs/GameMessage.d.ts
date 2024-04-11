/// <reference types="node" />
import type { ISerializable, IMessageHeader, IMessage } from "../types.js";
export declare class MessageHeader implements IMessageHeader {
    private version;
    private id;
    private length;
    constructor(version: 0 | 257, id: number, length: number);
    getDataOffset(): number;
    getByteSize(): number;
    getVersion(): number;
    getId(): number;
    getLength(): number;
    setVersion(version: 0 | 257): void;
    setId(id: number): void;
    setLength(length: number): void;
    private serializeV0;
    private serializeV1;
    serialize(): Buffer;
    private deserializeV0;
    private deserializeV1;
    deserialize(data: Buffer): void;
}
export declare class SerializableData implements ISerializable {
    private data;
    constructor(requestedSize: number);
    serialize(): Buffer;
    deserialize(data: Buffer): void;
    getByteSize(): number;
    toString(): string;
}
export declare class GameMessage implements IMessage {
    header: MessageHeader;
    data: ISerializable;
    constructor(version: 0 | 257);
    getDataAsBuffer(): Buffer;
    /** The message length is the length of the message data, not including the id */
    getByteSize(): number;
    getData(): ISerializable;
    setData(data: ISerializable): void;
    serialize(): Buffer;
    deserialize(data: Buffer): void;
    toString(): string;
    static identifyVersion(data: Buffer): 0 | 257;
    static fromGameMessage(version: 0 | 257, source: GameMessage): GameMessage;
}
