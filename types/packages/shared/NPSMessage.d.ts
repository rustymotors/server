/// <reference types="node" resolution-mode="require"/>
import { JSONResponseOfGameMessage } from "../interfaces/index.js";
/**
 * @class NPSMessage
 * @property {number} msgNo
 * @property {number} msgVersion
 * @property {number} reserved
 * @property {Buffer} content
 * @property {number} msgLength
 * @property {"sent" | "received"} direction
 * @property {string} serviceName
 */
export declare class NPSMessage {
    /** @type {number} */
    msgNo: number;
    /** @type {number} */
    msgVersion: number;
    /** @type {number} */
    reserved: number;
    /** @type {Buffer} */
    content: Buffer;
    /** @type {number} */
    msgLength: number;
    /** @type {"sent" | "received"} */
    direction: "sent" | "received";
    /** @type {string} */
    serviceName: string;
    /**
     *
     * @param {"sent" | "received"} direction - the direction of the message flow
     */
    constructor(direction: "sent" | "received");
    /**
     *
     * @param {Buffer} buffer
     */
    setContent(buffer: Buffer): void;
    /**
     *
     * @return {string}
     */
    getPacketAsString(): string;
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     *
     * @param {Buffer} packet
     * @return {NPSMessage}
     * @memberof NPSMessage
     */
    deserialize(packet: Buffer): this;
    /**
     *
     * @param {string} messageType
     * @return {string}
     */
    dumpPacketHeader(messageType: string): string;
    /**
     * DumpPacket
     * @return {string}
     * @memberof NPSMsg
     */
    dumpPacket(): string;
    /**
     *
     * @return {NPSMessageJSON}
     */
    toJSON(): JSONResponseOfGameMessage;
}
//# sourceMappingURL=NPSMessage.d.ts.map