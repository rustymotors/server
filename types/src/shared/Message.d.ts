/// <reference types="node" />
import { SerializerBase } from "./SerializerBase.js";
import { IMessage, IMessageHeader, ISerializedObject } from "./interfaces.js";
export declare class Message extends SerializerBase implements ISerializedObject, IMessage {
    connectionId: string | null;
    toFrom: number;
    appID: number;
    _header: null | IMessageHeader;
    get header(): IMessageHeader;
    set header(value: IMessageHeader | null);
    sequence: number;
    flags: number;
    buffer: Buffer;
    constructor();
    serializeSize(): number;
    /**
     *
     * @param {Message} sourceNode
     * @returns {Message}
     */
    static from(sourceNode: IMessage): IMessage;
    serialize(): Buffer;
    /**
     * Deserialize the MessageNode from a buffer.
     * @param {Buffer} buf
     * @returns {Message}
     */
    static deserialize(buf: Buffer): IMessage;
    toString(): string;
}
