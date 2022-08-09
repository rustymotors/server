/**
 * @class
 * @property {number} msgNo
 * @property {number} msgVersion
 * @property {number} reserved
 * @property {Buffer} content
 * @property {number} msgLength
 * @property {"Sent" " Received"} direction
 * @property {string} serviceName
 */

import type { NPSMessageJSON } from "mcos-types/types.js";

export class NPSMessage {
    msgNo;
    msgVersion;
    reserved;
    content;
    msgLength;
    direction;
    serviceName;
    /**
     *
     * @param {"sent" | "received"} direction - the direction of the message flow
     */
    constructor(direction: "sent" | "received") {
        this.msgNo = 0;
        this.msgVersion = 0;
        this.reserved = 0;
        this.content = Buffer.from([0x01, 0x02, 0x03, 0x04]);
        this.msgLength = this.content.length + 12; // skipcq: JS-0377
        this.direction = direction;
        this.serviceName = "mcoserver:NPSMsg";
    }

    /**
     *
     * @param {Buffer} buffer
     * @return {void}
     */
    setContent(buffer: Buffer): void {
        this.content = buffer;
        this.msgLength = this.content.length + 12; // skipcq: JS-0377
    }

    /**
     *
     * @return {Buffer}
     */
    getContentAsBuffer(): Buffer {
        return this.content;
    }

    /**
     *
     * @return {string}
     */
    getPacketAsString(): string {
        return this.serialize().toString("hex");
    }

    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer {
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
                this.content.copy(packet, 12);
            }

            return packet;
        } catch (error) {
            if (error instanceof Error) {
                throw new TypeError(
                    `[NPSMsg] Error in serialize(): ${error.message}`
                );
            }
            throw new Error("[NPSMsg] Error in serialize(), error unknown");
        }
    }

    /**
     *
     * @param {Buffer} packet
     * @return {NPSMessage}
     * @memberof NPSMessage
     */
    deserialize(packet: {
        readInt16BE: (arg0: number) => number;
        slice: (arg0: number) => Buffer;
    }): NPSMessage {
        this.msgNo = packet.readInt16BE(0);
        this.msgLength = packet.readInt16BE(2);
        this.msgVersion = packet.readInt16BE(4);
        this.content = packet.slice(12);
        return this;
    }

    /**
     *
     * @param {string} messageType
     * @return {string}
     */
    dumpPacketHeader(messageType: string): string {
        return `NPSMsg/${messageType},
          ${JSON.stringify({
              direction: this.direction,
              msgNo: this.msgNo.toString(16),
              msgVersion: this.msgVersion,
              msgLength: this.msgLength,
          })}`;
    }

    /**
     * DumpPacket
     * @return {string}
     * @memberof NPSMsg
     */
    dumpPacket(): string {
        return `NPSMsg/NPSMsg,
          ${JSON.stringify({
              direction: this.direction,
              msgNo: this.msgNo.toString(16),
              msgVersion: this.msgVersion,
              msgLength: this.msgLength,
              content: this.content.toString("hex"),
              serialized: this.serialize().toString("hex"),
          })}`;
    }

    /**
     *
     * @return {INPSMessageJSON}
     */
    toJSON(): NPSMessageJSON {
        return {
            msgNo: this.msgNo,
            contextId: "",
            msgLength: this.msgLength,
            msgVersion: this.msgVersion,
            content: this.content.toString("hex"),
            direction: this.direction,
            rawBuffer: this.content.toString("hex"),
            opCode: 0,
            sessionkey: "",
        };
    }
}
