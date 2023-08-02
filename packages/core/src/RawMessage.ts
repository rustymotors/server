import { SerializerBase } from "@mcos/shared";
import { SerializedObject } from "@mcos/interfaces";

export class RawMessage extends SerializerBase implements SerializedObject {
    public id = 0;
    public length = 0;
    public data = Buffer.alloc(0)

    constructor() {
        super();
    }

    serialize(): Buffer {
        throw new Error("Method not implemented.");
    }
    serializeSize(): number {
        return 4
    }

    /**
     * Deserialize a buffer into a MessageNode.
     * @param {Buffer} buf
     * @returns {RawMessage}
     */
    public static deserialize(buf: Buffer): RawMessage {
        const msg = new RawMessage();

        msg.id = buf.readInt16BE(0)
        msg.length = buf.readInt16BE(2)
        msg.data = buf.subarray(4)
        return msg;
    }

    toString(): string {
        return `MessageHeader: id=${this.id}(${this.id.toString(16)}), length=${this.length}`;
    }
}
