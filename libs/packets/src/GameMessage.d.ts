/// <reference types="node" />
import { Serializable } from "./BasePacket.js";
import type { ISerializable, IMessage } from "./interfaces.js";
/**
 *
 */
export declare class GameMessageHeader extends Serializable implements ISerializable {
    private id;
    private length;
    private version;
    constructor(version: 0 | 1);
    getDataOffset(): number;
    getByteSize(): number;
    getVersion(): number;
    getId(): number;
    getLength(): number;
    setVersion(version: 0 | 1): void;
    setId(id: number): void;
    setLength(length: number): void;
    private serializeV0;
    private serializeV1;
    serialize(): Buffer;
    private deserializeV0;
    private deserializeV1;
    deserialize(data: Buffer): GameMessageHeader;
}
export declare class GameMessage extends Serializable implements IMessage {
    header: GameMessageHeader;
    data: ISerializable;
    constructor(version: 0 | 1);
    getDataBuffer(): Buffer;
    setDataBuffer(data: Buffer): void;
    /** The message length is the length of the message data, not including the id */
    getByteSize(): number;
    getData(): ISerializable;
    setData(data: ISerializable): void;
    serialize(): Buffer;
    deserialize(data: Buffer): GameMessage;
    toString(): string;
    static identifyVersion(data: Buffer): 0 | 257;
}
