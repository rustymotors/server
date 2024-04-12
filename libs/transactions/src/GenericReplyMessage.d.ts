/**
 * @class
 * @property {number} msgNo
 * @property {number} toFrom
 * @property {number} appId
 * @property {number} msgReply
 * @property {Buffer} result
 * @property {Buffer} data
 * @property {Buffer} data2
 */
/// <reference types="node" />
import { SerializedBuffer } from "rusty-shared";
export declare class GenericReply extends SerializedBuffer {
    msgNo: number;
    msgReply: number;
    result: number;
    data2: Buffer;
    rawBuffer: Buffer;
    constructor();
    serialize(): Buffer;
    asJSON(): {
        msgNo: number;
        msgReply: number;
        result: number;
        data: string;
        data2: string;
    };
    toString(): string;
}
export declare class GenericReplyMessage extends SerializedBuffer {
    msgNo: number;
    msgReply: number;
    result: number;
    data1: number;
    data2: number;
    /**
     * One of
     *
     * * MC_SUCCESS = 101 : Used with GenericReply structure to indicate that the request succeeded
     *
     * * MC_FAILED = 102  : Used with GenericReply structure to indicate that the request failed
     *
     * * MC_GENERIC_REPLY : Used with GenericReply structure for messages that return data
     */
    constructor();
    setResult(buffer: number): void;
    setData1(value: number): void;
    setData2(value: number): void;
    /**
     *
     * @param {Buffer} buffer
     * @return {GenericReplyMessage}
     */
    static deserialize(buffer: Buffer): GenericReplyMessage;
    /**
     * @override
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket(): string;
    toString(): string;
    size(): number;
}
