import { ClientMessageHeader, SerializedObject } from "../interfaces/index.js";
import { SerializerBase } from "./SerializerBase.js";

export class MessageHeader extends SerializerBase implements SerializedObject {
    private _length = 0;
    public get length(): number {
        return this._length;
    }
    public set length(value: number) {
        this._length = value;
    }
    private _signature = "";
    public get signature(): string {
        return this._signature;
    }
    public set signature(value: string) {
        this._signature = value;
    }

    constructor() {
        super();
    }

    serialize(): Buffer {
        throw new Error("Method not implemented.");
    }
    serializeSize(): number {
        throw new Error("Method not implemented.");
    }

    /**
     * Deserialize a buffer into a MessageNode.
     * @param {Buffer} buf
     * @returns {MessageHeader}
     */
    public static deserialize(buf: Buffer): ClientMessageHeader {
        const header: ClientMessageHeader = new MessageHeader();
        header.length = SerializerBase._deserializeWord(buf.subarray(0, 2));
        const length = 4;
        let signature = "";
        for (let i = 0; i < length; i++) {
            signature += String.fromCharCode(buf.readUInt8(i + 2));
        }

        header.signature = signature;
        return header;
    }

    toString(): string {
        return `MessageHeader: length=${this.length}, signature=${this.signature}`;
    }
}
