/// <reference types="node" />
import { NPSMessage } from "mcos/shared";
import { TServerLogger, TConfiguration, TNPSMessageJSON } from "mcos/shared/interfaces";
/**
 *
 *
 * @export
 * @typedef {object} NPSMessageValues
 * @property {number} msgNo
 * @property {number} msgVersion
 * @property {number} reserved
 * @property {Buffer} content
 * @property {number} msgLength
 * @property {"sent" | "received"} direction
 * @property {string} serviceName
 */
/**
 *
 * @class NPSUserStatus
 * @extends {NPSMessage}
 * @property {string} sessionKey
 * @property {string} opCode
 * @property {Buffer} buffer
 */
export declare class NPSUserStatus extends NPSMessage {
    /** @type {string | null} */
    sessionKey: string | null;
    opCode: number;
    contextId: string;
    buffer: Buffer;
    _log: TServerLogger;
    _config: TConfiguration;
    constructor(packet: Buffer, config: TConfiguration, log: TServerLogger);
    /**
     * ExtractSessionKeyFromPacket
     *
     * Take 128 bytes
     * They are the utf-8 of the hex bytes that are the key
     *
     * @param {Buffer} packet
     * @return {void}
     */
    extractSessionKeyFromPacket(packet: Buffer): void;
    /**
     *
     * @return {TNPSMessageJSON}
     */
    toJSON(): TNPSMessageJSON;
    /**
     * @return {string}
     */
    dumpPacket(): string;
}
