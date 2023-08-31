/**
 * @class MessageNode
 * @property {"sent" | "received"} direction
 * @property {number} msgNo
 * @property {number} seq
 * @property {number} flags
 * @property {Buffer} data
 * @property {number} dataLength
 * @property {string} mcoSig
 * @property {number} toFrom
 * @property {number} appId
 * @property {Buffer} rawPacket
 */
/// <reference types="node" resolution-mode="require"/>
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
    /**
     *
     * @param {"sent" | "received"} direction
     */
    constructor(direction: "sent" | "received");
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
     */
    BaseMsgHeader(packet: Buffer): void;
}
//# sourceMappingURL=MessageNode.d.ts.map