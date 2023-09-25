import { ServerError } from "./errors/ServerError.js";

export class MessageNode {
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
    static fromRawMessage(rawMessage) {
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
    deserialize(packet) {
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
        this._seq = packet.readInt16LE(offset);
        offset += 2;
        this._flags = packet.readInt8(offset);
        offset += 1; // offset = 9
        this._data = packet.subarray(offset, offset + length - 9);
        if (this._data.length > 2) {
            this._msgNo = this._data.readInt16LE(0);
        }
    }

    /**
     *
     * @return {Buffer}
     */
    serialize() {
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
        if (typeof this._data === "undefined") {
            throw new ServerError("MessageNode data is undefined");
        }
        this._data.copy(packet, offset);
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
