/// <reference types="node" resolution-mode="require"/>
import { JSONResponseOfGameMessage } from "../../interfaces/index.js";
import { NPSMessage } from "../../shared/NPSMessage.js";
import { Logger } from "pino";
import { Configuration } from "../../shared/Configuration.js";
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
    log: Logger;
    _config: Configuration;
    constructor(packet: Buffer, config: Configuration, log: Logger);
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
     * @return {JSONResponseOfGameMessage}
     */
    toJSON(): JSONResponseOfGameMessage;
    /**
     * @return {string}
     */
    dumpPacket(): string;
}
//# sourceMappingURL=NPSUserStatus.d.ts.map