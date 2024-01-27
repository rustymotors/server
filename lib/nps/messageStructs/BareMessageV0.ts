import { lessThan } from "../utils/pureCompare.js";
import { getAsHex } from "../utils/pureGet.js";
import { Message } from "../types.js";
import { HeaderV0 } from "./HeaderV0.js";

export class BareMessageV0 implements Message {
    private header = new HeaderV0(0, 0);
    private message: Buffer;

    constructor(bytes: Buffer, messageLength: number) {
        if (lessThan(bytes.length, messageLength)) {
            throw new Error(
                `Message length ${messageLength} is longer than buffer length ${bytes.length}`,
            );
        }

        this.header.parse(bytes);
        this.message = bytes.subarray(4, messageLength);
        console.log(this.toString());
    }

    static new(id: number): BareMessageV0 {
        const message = new BareMessageV0(Buffer.alloc(4), 4);
        message.setMessageId(id);
        return message;
    }

    static fromBytes(bytes: Buffer, length: number): BareMessageV0 {
        return new BareMessageV0(bytes, length);
    }

    getMessageId(): number {
        return this.header.getMessageId();
    }

    setMessageId(id: number) {
        this.header.setMessageId(id);
    }

    getMessageLength(): number {
        return this.header.getMessageLength();
    }

    setMessageLength(length: number) {
        this.header.setMessageLength(length);
    }

    getData(): Buffer {
        return this.message;
    }

    setData(data: Buffer) {
        this.message = data;
        this.setMessageLength(this.header.getSize() + data.length);
    }

    getDataAsHex(): string {
        return getAsHex(this.getData());
    }

    toBytes(): Buffer {
        const buf = Buffer.alloc(this.header.getMessageLength());
        return Buffer.concat([this.header.toBytes(), this.message]);
    }

    toString(): string {
        return `BareMessageV0:
        header: ${this.header.toString()}
        message: ${this.getDataAsHex()}
        `;        
    }

    toHex(): string {
        return getAsHex(this.toBytes());
    }

    getSize(): number {
        return this.header.getMessageLength();
    }
}
