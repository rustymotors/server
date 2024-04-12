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

import { SerializedBuffer } from "rusty-shared";

export class GenericReply extends SerializedBuffer {
    msgNo: number;
    msgReply: number;
    result: number;
    data2: Buffer;
    rawBuffer!: Buffer;
    constructor() {
        super();
        this.msgNo = 0; // 2 bytes (ethier MC_SUCCESS (0x101) or MC_FAILURE(0x102))
        this.msgReply = 0; // 2 bytes (message # being replied to (ex: MC_PURCHASE_STOCK_CAR))
        this.result = 0; // 4 bytes (specific to the message sent, often the reason for a failure)
        this.setBuffer(Buffer.alloc(4)); // 4 bytes (specific to the message sent (but usually 0))
        this.data2 = Buffer.alloc(4); // 4 bytes (specific to the message sent (but usually 0))
    }

    override serialize() {
        this.rawBuffer = Buffer.alloc(16);
        this.rawBuffer.writeInt16LE(this.msgNo, 0);
        this.rawBuffer.writeInt16LE(this.msgReply, 2);
        this.rawBuffer.writeInt16LE(this.result, 4);
        this.data.copy(this.rawBuffer, 8);
        this.data2.copy(this.rawBuffer, 12);
        return this.rawBuffer;
    }

    asJSON() {
        return {
            msgNo: this.msgNo,
            msgReply: this.msgReply,
            result: this.result,
            data: this.data.toString("hex"),
            data2: this.data2.toString("hex"),
        };
    }

    override toString() {
        return this.serialize().toString("hex");
    }
}

export class GenericReplyMessage extends SerializedBuffer {
    msgNo: number;
    msgReply: number;
    result: number;
    data1: number;
    data2: number;
    /**
     * One of
     *
     * * MC_SUCCESS = 101 : Used with GenericReply structure to indicate that the request succeeded
     *
     * * MC_FAILED = 102  : Used with GenericReply structure to indicate that the request failed
     *
     * * MC_GENERIC_REPLY : Used with GenericReply structure for messages that return data
     */
    constructor() {
        super();
        this.msgNo = 0; // 2 bytes
        this.msgReply = 0; // 2 bytes
        this.result = 0; // 4 bytes
        this.data1 = 0; // 4 bytes
        this.data2 = 0; // 4 bytes
    }

    setResult(buffer: number) {
        this.result = buffer;
    }

    setData1(value: number) {
        this.data1 = value;
    }

    setData2(value: number) {
        this.data2 = value;
    }

    /**
     *
     * @param {Buffer} buffer
     * @return {GenericReplyMessage}
     */
    static deserialize(buffer: Buffer): GenericReplyMessage {
        const node = new GenericReplyMessage();

        try {
            node.msgNo = buffer.readInt16LE(0);
        } catch (error) {
            if (error instanceof RangeError) {
                // This is likeley not an MCOTS packet, ignore
            } else {
                const err = new TypeError(
                    `[GenericReplyMsg] Unable to read msgNo from ${buffer.toString(
                        "hex",
                    )}: ${String(error)}`,
                ); // skipcq: JS-0378
                throw err;
            }
        }

        node.msgReply = buffer.readInt16LE(2);
        node.result = buffer.readInt32LE(4);
        node.data1 = buffer.readInt32LE(8);
        node.data2 = buffer.readInt32LE(12);
        return node;
    }

    /**
     * @override
     * @return {Buffer}
     */
    override serialize(): Buffer {
        const packet = Buffer.alloc(this.size());
        let offset = 0;
        packet.writeInt16LE(this.msgNo, offset);
        offset += 2;
        packet.writeInt16LE(this.msgReply, offset);
        offset += 2;
        packet.writeInt16LE(this.result, offset);
        offset += 4;
        packet.writeInt16LE(this.data1, offset);
        offset += 4;
        packet.writeInt16LE(this.data2, offset);
        // offset is now 16
        return packet;
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
            result: this.result,
            data: this.data1,
            tdata2: this.data2,
        })}`;
    }

    override toString(): string {
        return `GenericReply: 
        MsgNo: ${this.msgNo}
        MsgReply: ${this.msgReply}
        Result: ${this.result}
        Data: ${this.data1}
        Data2: ${this.data2}
        `;
    }

    override size(): number {
        return 16;
    }
}
