import { privateDecrypt } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { NPSMessage } from "../../mcos-gateway/src/NPSMessage.js";
import { Sentry } from "mcos/shared";

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
    sessionKey = null;
    opCode;
    contextId;
    buffer;

    /** @type {import("mcos/shared").TServerLogger} */
    #log;

    /** @type {import("mcos/shared").TServerConfiguration} */
    #config

    /**
     *
     * @param {Buffer} packet
     * @param {import("mcos/shared").TServerConfiguration} config
     * @param {import("mcos/shared").TServerLogger} log
     */
    constructor(packet, config, log) {
        super("received");
        this.#config = config
        this.#log = log;
        log("debug", "Constructing NPSUserStatus");
        this.sessionkey = "";

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
    extractSessionKeyFromPacket(packet) {
        this.#log("debug", "Extracting key");
        // Decrypt the sessionkey
        const privateKey = this.#config.privateKeyContents

        const sessionkeyString = Buffer.from(
            packet.subarray(52, -10).toString("utf8"),
            "hex"
        );
        const decrypted = privateDecrypt(privateKey, sessionkeyString);
        this.sessionkey = decrypted.subarray(2, -4).toString("hex");
    }

    /**
     *
     * @return {import("../../mcos-gateway/src/NPSMessage.js").NPSMessageJSON}
     */
    toJSON() {
        this.#log("debug", "Returning as JSON");
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
    dumpPacket() {
        this.#log("debug", "Returning as string");
        let message = this.dumpPacketHeader("NPSUserStatus");
        message = message.concat(
            `NPSUserStatus,
        ${JSON.stringify({
            contextId: this.contextId,
            sessionkey: this.sessionkey,
        })}`
        );
        return message;
    }
}
