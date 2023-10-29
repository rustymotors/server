/**
 * @module shared/NPSMessage
 */

import { ServerError } from "./errors/ServerError.js";

/**
 * @class NPSMessage
 */
export class NPSMessage {
    constructor() {
        this.msgNo = 0;
        this.msgVersion = 0;
        this.reserved = 0;
        this.data = Buffer.alloc(0);
        this.msgLength = 0;
    }

    /**
     *
     * @param {Buffer} buffer
     */
    setContent(buffer) {
        this.data = buffer;
        this.msgLength = this.data.length + 12; // skipcq: JS-0377
    }

    /**
     *
     * @return {Buffer}
     */
    serialize() {
        try {
            const packet = Buffer.alloc(this.msgLength);
            packet.writeInt16BE(this.msgNo, 0);
            packet.writeInt16BE(this.msgLength, 2);
            if (this.msgLength > 4) {
                packet.writeInt16BE(this.msgVersion, 4);
                packet.writeInt16BE(this.reserved, 6);
            }

            if (this.msgLength > 8) {
                packet.writeInt32BE(this.msgLength, 8);
                this.data.copy(packet, 12);
            }

            return packet;
        } catch (error) {
            if (error instanceof Error) {
                const err = new ServerError(
                    `[NPSMsg] Error in serialize(): ${error.message}`,
                );
                throw err;
            }
            const err = new ServerError(
                "[NPSMsg] Error in serialize(), error unknown",
            );
            throw err;
        }
    }

    /**
     *
     * @param {Buffer} packet
     * @return {NPSMessage}
     */
    deserialize(packet) {
        this.msgNo = packet.readInt16BE(0);
        this.msgLength = packet.readInt16BE(2);
        this.msgVersion = packet.readInt16BE(4);
        this.data = packet.subarray(12);
        return this;
    }

    toString() {
        return `NPSMessage: ${JSON.stringify({
            msgNo: this.msgNo,
            msgLength: this.msgLength,
            msgVersion: this.msgVersion,
            reserved: this.reserved,
            content: this.data.toString("hex"),
        })}`;
    }
}
