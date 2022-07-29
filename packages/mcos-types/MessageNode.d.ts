/// <reference types="node" />
/**
 * @class
 */
export declare class MessageNode {
    direction: "sent" | "received";
    msgNo: number;
    seq: number;
    flags: number;
    data: Buffer;
    dataLength: number;
    mcoSig: string;
    toFrom: number;
    appId: number;
    rawPacket: Buffer;
    constructor(direction: "sent" | "received");
    deserialize(packet: Buffer): void;
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     *
     * @param {number} appId
     * @return {void}
     */
    setAppId(appId: number): void;
    /**
     *
     * @param {number} newMessageNo
     * @return {void}
     */
    setMsgNo(newMessageNo: number): void;
    /**
     *
     * @param {number} newSeq
     * @return {void}
     */
    setSeq(newSeq: number): void;
    /**
     *
     * @param {Buffer} packet
     * @return {void}
     */
    setMsgHeader(packet: Buffer): void;
    /**
     *
     * @param {Buffer} buffer
     * @return {void}
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
     * Returns a formatted representation of the packet as a string
     * @returns {string}
     */
    toString(): string;
    /**
     *
     * @return {number}
     */
    getLength(): number;
    /**
     *
     * @param {Buffer} packet
     * @return {void}
     */
    BaseMsgHeader(packet: {
        readInt16LE: (arg0: number) => number;
    }): void;
}
