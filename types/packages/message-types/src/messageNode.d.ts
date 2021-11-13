/// <reference types="node" />
/**
 * Packet structure for communications with the game database
 * @module MessageNode
 */
/**
 * @class
 * @property {EMessageDirection} direction
 * @property {number} msgNo
 * @property {number} seq
 * @property {number} flags
 * @property {Buffer} data
 * @property {number} dataLength
 * @property {string} mcoSig
 * @property {number} toFrom
 * @property {number} appId
 */
export class MessageNode {
    /**
     *
     * @param {EMessageDirection} direction
     */
    constructor(direction: any);
    direction: any;
    msgNo: number;
    seq: number;
    flags: number;
    data: Buffer;
    dataLength: number;
    mcoSig: string;
    toFrom: number;
    appId: number;
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
    /**
     *
     * @param {number} appId
     */
    setAppId(appId: number): void;
    /**
     *
     * @param {number} newMessageNo
     */
    setMsgNo(newMessageNo: number): void;
    /**
     *
     * @param {number} newSeq
     */
    setSeq(newSeq: number): void;
    /**
     *
     * @param {Buffer} packet
     */
    setMsgHeader(packet: Buffer): void;
    /**
     *
     * @param {Buffer} buffer
     */
    updateBuffer(buffer: Buffer): void;
    /**
     *
     * @return {boolean}
     */
    isMCOTS(): boolean;
    /**
     *
     * @return {string}
     */
    dumpPacket(): string;
    /**
     *
     * @return {number}
     */
    getLength(): number;
    /**
     *
     * @param {Buffer} packet
     */
    BaseMsgHeader(packet: Buffer): void;
}
import { Buffer } from "buffer";
