/// <reference types="node" resolution-mode="require"/>
import { SerializedObject, ClientMessage, ClientMessageHeader } from "../interfaces/index.js";
import { MessageNode } from "./MessageNode.js";
import { SerializerBase } from "./SerializerBase.js";
export declare class Message extends SerializerBase implements SerializedObject, ClientMessage {
    connectionId: string | null;
    toFrom: number;
    appId: number;
    opCode: number | null;
    header: null | ClientMessageHeader;
    sequence: number;
    flags: number;
    rawBuffer: Buffer;
    constructor();
    serializeSize(): number;
    /**
     *
     * @param {Message} sourceNode
     * @returns {Message}
     */
    static from(sourceNode: ClientMessage): ClientMessage;
    static fromMessageNode(sourceNode: MessageNode): ClientMessage;
    serialize(): Buffer;
    /**
     * Deserialize the MessageNode from a buffer.
     * @param {Buffer} buf
     * @returns {Message}
     */
    static deserialize(buf: Buffer): ClientMessage;
    toString(): string;
}
//# sourceMappingURL=Message.d.ts.map