import { MessageHeader } from "./MessageHeader.js";
import { MessageNode } from "./MessageNode.js";
import { SerializerBase } from "./SerializerBase.js";
import {
    ClientMessage,
    ClientMessageHeader,
    SerializedObject,
} from "@mcos/interfaces";

export class Message
    extends SerializerBase
    implements SerializedObject, ClientMessage
{
    connectionId: string | null = null;
    toFrom: number;
    appId: number;
    opCode: number | null = null;
    header: null | ClientMessageHeader;
    sequence: number;
    flags: number;
    rawBuffer: Buffer;

    constructor() {
        super();
        this.toFrom = 0;
        this.appId = 0;

        /** @type {MessageHeader | null} */
        this.header = null;

        this.sequence = 0;
        this.flags = 0;
        this.rawBuffer = Buffer.alloc(0);
    }
    serializeSize(): number {
        throw new Error("Method not implemented.");
    }

    /**
     *
     * @param {Message} sourceNode
     * @returns {Message}
     */
    static from(sourceNode: ClientMessage): ClientMessage {
        const node: ClientMessage = new Message();
        node.toFrom = sourceNode.toFrom;
        node.sequence = sourceNode.sequence;
        node.flags = sourceNode.flags;
        node.opCode = sourceNode.opCode;
        node.header = sourceNode.header;
        if (!node.header) {
            throw new Error("Message.from: header is null");
        }
        if (!sourceNode.header) {
            throw new Error("Message.from: sourceNode.header is null");
        }
        node.header.length = sourceNode.header.length;
        node.rawBuffer = sourceNode.rawBuffer;
        return node;
    }

    static fromMessageNode(sourceNode: MessageNode): ClientMessage {
        const node: ClientMessage = new Message();
        node.toFrom = sourceNode.toFrom;
        node.sequence = sourceNode.seq;
        node.flags = sourceNode.flags;
        node.opCode = sourceNode.msgNo;
        node.header = new MessageHeader();
        node.header.length = sourceNode.dataLength;
        node.rawBuffer = sourceNode.data;

        return node;
    }

    override serialize(): Buffer {
        SerializerBase.verifyConnectionId(this);
        let buf = Buffer.alloc(0);
        if (!this.header) {
            throw new Error("Message.serialize: header is null");
        }

        buf = Buffer.concat([buf, this.header.serialize()]);
        buf = Buffer.concat([
            buf,
            SerializerBase._serializeWord(this.sequence),
        ]);
        buf = Buffer.concat([buf, SerializerBase._serializeByte(this.flags)]);
        buf = Buffer.concat([buf, this.rawBuffer]);
        return buf;
    }

    /**
     * Deserialize the MessageNode from a buffer.
     * @param {Buffer} buf
     * @returns {Message}
     */
    static deserialize(buf: Buffer): ClientMessage {
        const node = new Message();
        node.header = MessageHeader.deserialize(buf.subarray(0, 6));
        node.sequence = SerializerBase._deserializeWord(buf.subarray(6, 8));
        node.flags = SerializerBase._deserializeByte(buf.subarray(10, 11));
        node.rawBuffer = buf.subarray(11);
        return node;
    }

    toString(): string {
        SerializerBase.verifyConnectionId(this);
        return `Message: header=${this.header}, sequence=${
            this.sequence
        }, flags=${this.flags}, buffer=${this.rawBuffer.toString("hex")}"}`;
    }
}
