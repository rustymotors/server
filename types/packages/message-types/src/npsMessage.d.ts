/// <reference types="node" />
export type INPSMessageJSON = {
    msgNo: number;
    opCode: number | undefined;
    msgLength: number;
    msgVersion: number;
    content: string;
    contextId: string;
    direction: import("../../transactions/src/types").EMessageDirection;
    sessionkey: string | undefined;
    rawBuffer: string;
};
/**
 * Packet container for NPS messages
 * @module NPSMsg
 */
/**
 *
 * @export
 * @typedef {Object} INPSMessageJSON
 * @property {number} msgNo
 * @property {number | undefined} opCode
 * @property {number} msgLength
 * @property {number} msgVersion
 * @property {string} content
 * @property {string} contextId
 * @property {import("../../transactions/src/types").EMessageDirection} direction
 * @property {string | undefined } sessionkey
 * @property {string} rawBuffer
 */
/**
 * @class
 * @property {number} msgNo
 * @property {number} msgVersion
 * @property {number} reserved
 * @property {Buffer} content
 * @property {number} msgLength
 * @property {MESSAGE_DIRECTION} direction
 */
export class NPSMessage {
    /**
     *
     * @param {import("../../transactions/src/types").EMessageDirection} direction - the direction of the message flow
     */
    constructor(direction: import("../../transactions/src/types").EMessageDirection);
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
    /** @type {import("../../transactions/src/types").EMessageDirection} */
    direction: import("../../transactions/src/types").EMessageDirection;
    serviceName: string;
    /**
     *
     * @param {Buffer} buffer
     */
    setContent(buffer: Buffer): void;
    /**
     *
     * @return {Buffer}
     */
    getContentAsBuffer(): Buffer;
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
     */
    deserialize(packet: Buffer): NPSMessage;
    /**
     *
     * @param {string} messageType
     * @returns {string}
     */
    dumpPacketHeader(messageType: string): string;
    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket(): string;
    /**
     *
     * @return {INPSMessageJSON}
     */
    toJSON(): INPSMessageJSON;
}
import { Buffer } from "buffer";
