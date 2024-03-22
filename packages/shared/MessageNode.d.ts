/// <reference types="node" />
import { SerializedBuffer } from "./messageFactory.js";
export declare class MessageNode {
    header: {
        length: number;
        mcoSig: string;
    };
    seq: number;
    flags: number;
    data: Buffer;
    msgNo: number;
    constructor();
    /**
     * @static
     * @param {module:shared/RawMessage} rawMessage
     * @return {MessageNode}
     */
    static fromRawMessage(rawMessage: SerializedBuffer): MessageNode;
    get size(): number;
    /**
     *
     * @param {Buffer} packet
     */
    deserialize(packet: Buffer): void;
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
    toString(): string;
}
