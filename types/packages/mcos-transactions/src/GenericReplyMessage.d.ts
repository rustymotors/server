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
import { MessageNode } from "mcos/shared";
export declare class GenericReplyMessage extends MessageNode {
    /**
     * One of
     *
     * * MC_SUCCESS = 101 : Used with GenericReply structure to indicate that the request succeeded
     *
     * * MC_FAILED = 102  : Used with GenericReply structure to indicate that the request failed
     *
     * * MC_GENERIC_REPLY : Used with GenericReply structure for messages that return data
     */
    msgNo: number;
    toFrom: number;
    appId: number;
    msgReply: number;
    result: Buffer;
    data: Buffer;
    data2: Buffer;
    /**
     *
     */
    constructor();
    /**
     * Setter data
     * @param {Buffer} value
     */
    setData(value: Buffer): void;
    /**
     * Setter data2
     * @param {Buffer} value
     */
    setData2(value: Buffer): void;
    /**
     *
     * @param {Buffer} buffer
     */
    deserialize(buffer: Buffer): void;
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     *
     * @param {Buffer} buffer
     */
    setResult(buffer: Buffer): void;
    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket(): string;
}
