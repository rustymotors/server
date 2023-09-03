import { privateDecrypt } from "node:crypto";
import { JSONResponseOfGameMessage } from "../../interfaces/index.js";
import { NPSMessage } from "../../shared/NPSMessage.js";
import { Logger } from "pino";
import { Configuration } from "../../shared/Configuration.js";
import { readFileSync } from "node:fs";

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

export class NPSUserStatus extends NPSMessage {
    /** @type {string | null} */
    sessionKey: string | null = null;
    opCode;
    contextId;
    buffer;

    log: Logger;

    _config: Configuration;

    constructor(packet: Buffer, config: Configuration, log: Logger) {
        super("received");
        this._config = config;
        this.log = log;
        log.debug("Constructing NPSUserStatus");
        this.sessionKey = "";

        // Save the NPS opCode
        this.opCode = packet.readInt16LE(0);

        // Save the contextId
        this.contextId = packet.subarray(14, 48).toString();

        // Save the raw packet
        this.buffer = packet;
    }

    /**
     * ExtractSessionKeyFromPacket
     *
     * Take 128 bytes
     * They are the utf-8 of the hex bytes that are the key
     *
     * @param {Buffer} packet
     * @return {void}
     */
    extractSessionKeyFromPacket(packet: Buffer): void {
        this.log.debug("Extracting key");
        // Decrypt the sessionkey
        try {
            const privatekeyContents = readFileSync(
                this._config.privateKeyFile,
            );

        const sessionkeyString = Buffer.from(
            packet.subarray(52, -10).toString("utf8"),
            "hex",
        );
        const decrypted = privateDecrypt(privatekeyContents, sessionkeyString);
        this.sessionKey = decrypted.subarray(2, -4).toString("hex");
        } catch (error) {
            throw new Error(`Unable to extract session key: ${String(error)}`);
        }
    }

    /**
     *
     * @return {JSONResponseOfGameMessage}
     */
    toJSON(): JSONResponseOfGameMessage {
        this.log.debug("Returning as JSON");
        return {
            msgNo: this.msgNo,
            msgLength: this.msgLength,
            msgVersion: this.msgVersion,
            content: this.content.toString("hex"),
            direction: this.direction,
            opCode: this.opCode,
            contextId: this.contextId,
            sessionKey: this.sessionKey,
            rawBuffer: this.buffer.toString("hex"),
        };
    }

    /**
     * @return {string}
     */
    dumpPacket(): string {
        this.log.debug("Returning as string");
        let message = this.dumpPacketHeader("NPSUserStatus");
        message = message.concat(
            `NPSUserStatus,
        ${JSON.stringify({
            contextId: this.contextId,
            sessionkey: this.sessionKey,
        })}`,
        );
        return message;
    }
}
