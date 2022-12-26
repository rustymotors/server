import { privateDecrypt } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { NPSMessage } from "../../mcos-gateway/src/NPSMessage.js";

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
    /**
     *
     * @param {Buffer} packet
     */
    constructor(packet) {
        super("received");
        this.sessionkey = "";

        // Save the NPS opCode
        this.opCode = packet.readInt16LE(0);

        // Save the contextId
        this.contextId = packet.subarray(14, 48).toString();

        // Save the raw packet
        this.buffer = packet;
    }

    /**
     * Load the RSA private key
     *
     * @param {string} privateKeyPath
     * @return {string}
     */
    fetchPrivateKeyFromFile(privateKeyPath) {
        try {
            statSync(privateKeyPath);
        } catch (error) {
            if (error instanceof Error) {
                throw new TypeError(
                    `[npsUserStatus] Error loading private key: ${error.message.toString()}`
                );
            }

            throw new Error(
                "[npsUserStatus] Error loading private key, error unknown"
            );
        }

        return readFileSync(privateKeyPath).toString();
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
        if (typeof process.env["PRIVATE_KEY_FILE"] === "undefined") {
            throw new Error("Please set PRIVATE_KEY_FILE");
        }
        // Decrypt the sessionkey
        const privateKey = this.fetchPrivateKeyFromFile(
            process.env["PRIVATE_KEY_FILE"]
        );

        const sessionkeyString = Buffer.from(
            packet.subarray(52, -10).toString("utf8"),
            "hex"
        );
        const decrypted = privateDecrypt(privateKey, sessionkeyString);
        this.sessionkey = decrypted.slice(2, -4).toString("hex");
    }

    /**
     *
     * @override
     * @return {import("../../mcos-gateway/src/NPSMessage.js").NPSMessageJSON}
     */
    toJSON() {
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
     * @override
     * @return {string}
     */
    dumpPacket() {
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
