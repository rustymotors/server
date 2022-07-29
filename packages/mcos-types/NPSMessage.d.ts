import type { INPSMessage, INPSMessageJSON } from './index.js';
/**
 * @class
 * @property {number} msgNo
 * @property {number} msgVersion
 * @property {number} reserved
 * @property {Buffer} content
 * @property {number} msgLength
 * @property {EMESSAGE_DIRECTION} direction
 * @property {string} serviceName
 */
export declare class NPSMessage implements INPSMessage {
    msgNo: number;
    msgVersion: number;
    reserved: number;
    content: Buffer;
    msgLength: number;
    direction: any;
    serviceName: string;
    /**
     *
     * @param {EMESSAGE_DIRECTION} direction - the direction of the message flow
     */
    constructor(direction: any);
    /**
     *
     * @param {Buffer} buffer
     * @return {void}
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
     * @memberof NPSMessage
     */
    deserialize(packet: {
        readInt16BE: (arg0: number) => number;
        slice: (arg0: number) => Buffer;
    }): NPSMessage;
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
     * @return {INPSMessageJSON}
     */
    toJSON(): INPSMessageJSON;
}
