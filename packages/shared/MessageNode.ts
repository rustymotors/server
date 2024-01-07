import { SerializedBuffer } from "./messageFactory.js";

export class MessageNode {
    header: {
        length: number; // 2 bytes
        mcoSig: string;
    };
    seq: number;
    flags: number;
    data: Buffer;
    msgNo: number;
    constructor() {
        this.header = {
            length: 0, // 2 bytes
            mcoSig: "", // 4 bytes
        };
        this.seq = 999; // 2 bytes
        this.flags = 0; // 1 byte
        this.data = Buffer.alloc(0);
        this.msgNo = 999; // 2 bytes
    }

    /**
     * @static
     * @param {module:shared/RawMessage} rawMessage
     * @return {MessageNode}
     */
    static fromRawMessage(rawMessage: SerializedBuffer): MessageNode {
        const messageNode = new MessageNode();
        messageNode.deserialize(rawMessage.serialize());

        if (messageNode.data.length > 2) {
            messageNode.msgNo = messageNode.data.readInt16LE(0);
        }

        return messageNode;
    }

    get size() {
        return this.data.length + 9;
    }

    /**
     *
     * @param {Buffer} packet
     */
    deserialize(packet: Buffer) {
        const length = packet.readInt16LE(0);
        if (length !== packet.length) {
            throw new Error(
                `[MessageNode] Length of packet ${length.toString()} does not match length of buffer ${packet.length.toString()}`,
            );
        }
        this.header.length = length;
        let offset = 2;
        this.header.mcoSig = packet.subarray(offset, offset + 4).toString();
        offset += 4;
        this.seq = packet.readInt16LE(offset);
        offset += 2;
        this.flags = packet.readInt8(offset);
        offset += 1; // offset = 9
        this.data = packet.subarray(offset, offset + length - 9);
        if (this.data.length > 2) {
            this.msgNo = this.data.readInt16LE(0);
        }
    }

    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer {
        const packet = Buffer.alloc(this.header.length);
        let offset = 0;
        packet.writeInt16LE(this.header.length, offset);
        offset += 2;
        packet.write(this.header.mcoSig, offset, 4);
        offset += 4;
        packet.writeInt16LE(this.seq, offset);
        offset += 2;
        packet.writeInt8(this.flags, offset);
        offset += 1;
        if (typeof this.data === "undefined") {
            throw new Error("MessageNode data is undefined");
        }
        this.data.copy(packet, offset);
        return packet;
    }

    toString() {
        return `MessageNode: ${JSON.stringify({
            header: this.header,
            seq: this.seq,
            flags: this.flags,
            data: this.data.toString("hex"),
            msgNo: this.msgNo,
        })}`;
    }
}
