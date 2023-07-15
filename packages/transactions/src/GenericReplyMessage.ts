// WORD  msgNo;    // typically MC_SUCCESS or MC_FAILURE
// WORD  msgReply; // message # being replied to (ex: MC_PURCHASE_STOCK_CAR)
// DWORD result; // specific to the message sent, often the reason for a failure
// DWORD data;   // specific to the message sent (but usually 0)
// DWORD data2;
/**
 * @class
 * @property {number} msgNo
 * @property {number} toFrom
 * @property {number} appId
 * @property {number} msgReply
 * @property {Buffer} result
 * @property {Buffer} data
 * @property {Buffer} data2
 */

import { ClientMessage } from "@mcos/interfaces";
import { Message } from "@mcos/shared";

export class GenericReplyMessage extends Message implements ClientMessage {
    /**
     * One of
     *
     * * MC_SUCCESS = 101 : Used with GenericReply structure to indicate that the request succeeded
     *
     * * MC_FAILED = 102  : Used with GenericReply structure to indicate that the request failed
     *
     * * MC_GENERIC_REPLY : Used with GenericReply structure for messages that return data
     */
    msgNo; // 2 bytes
    toFrom;
    appId;
    msgReply;
    result;
    data;
    data2;
    rawBuffer: Buffer;

    constructor() {
        super();
        this.msgNo = 0;
        this.toFrom = 0;
        this.appId = 0;
        this.msgReply = 0;
        this.result = Buffer.alloc(4);
        this.data = Buffer.alloc(4);
        this.data2 = Buffer.alloc(4);
        this.rawBuffer = Buffer.alloc(0);
    }

    /**
     * Setter data
     * @param {Buffer} value
     */
    setData(value: Buffer) {
        this.data = value;
    }

    /**
     * Setter data2
     * @param {Buffer} value
     */
    setData2(value: Buffer) {
        this.data2 = value;
    }

    /**
     *
     * @param {Buffer} buffer
     */
    static deserialize(buffer: Buffer): GenericReplyMessage {
        const node = new GenericReplyMessage();
        node.rawBuffer = buffer;
        try {
            node.msgNo = buffer.readInt16LE(0);
        } catch (error) {
            if (error instanceof RangeError) {
                // This is likeley not an MCOTS packet, ignore
            } else {
                const err = new TypeError(
                    `[GenericReplyMsg] Unable to read msgNo from ${buffer.toString(
                        "hex"
                    )}: ${String(error)}`
                ); // skipcq: JS-0378
                throw err;
            }
        }

        node.msgReply = buffer.readInt16LE(2);
        node.result = buffer.subarray(4, 8);
        node.data = buffer.subarray(8, 12);
        node.data2 = buffer.subarray(12);
        return node;
    }

    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer {
        const packet = Buffer.alloc(16);
        packet.writeInt16LE(this.msgNo, 0);
        packet.writeInt16LE(this.msgReply, 2);
        this.result.copy(packet, 4);
        this.data.copy(packet, 8);
        this.data2.copy(packet, 12);
        return packet;
    }

    /**
     *
     * @param {Buffer} buffer
     */
    setResult(buffer: Buffer) {
        this.result = buffer;
    }

    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket(): string {
        return `GenericReply',
        ${JSON.stringify({
            msgNo: this.msgNo,
            msgReply: this.msgReply,
            result: this.result.toString("hex"),
            data: this.data.toString("hex"),
            tdata2: this.data2.toString("hex"),
        })}`;
    }
}
