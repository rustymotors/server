/// <reference types="node" resolution-mode="require"/>
import { ClientMessageHeader, SerializedObject } from "../interfaces/index.js";
import { SerializerBase } from "./SerializerBase.js";
export declare class MessageHeader extends SerializerBase implements SerializedObject {
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
    static deserialize(buf: Buffer): ClientMessageHeader;
    toString(): string;
}
//# sourceMappingURL=MessageHeader.d.ts.map