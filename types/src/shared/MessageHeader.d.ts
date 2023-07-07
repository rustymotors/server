/// <reference types="node" />
import { SerializerBase } from "./SerializerBase.js";
import { IMessageHeader, ISerializedObject } from "./interfaces.js";
export declare class MessageHeader extends SerializerBase implements ISerializedObject {
    private _length;
    get length(): number;
    set length(value: number);
    private _signature;
    get signature(): string;
    set signature(value: string);
    constructor();
    serialize(): Buffer;
    serializeSize(): number;
    /**
     * Deserialize a buffer into a MessageNode.
     * @param {Buffer} buf
     * @returns {MessageHeader}
     */
    static deserialize(buf: Buffer): IMessageHeader;
    toString(): string;
}
