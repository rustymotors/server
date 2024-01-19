import { Header } from "./Header.js";
import { Message } from "../types.js";
import { lessThan } from "../utils/pureCompare.js";
import { getAsHex } from "../utils/pureGet.js";

export class BareMessage implements Message {
    private header = new Header(0, 0, 0);
    private message: Buffer;

    constructor(bytes: Buffer, messageLength: number) {
        if (lessThan(bytes.length, messageLength)) {
            throw new Error(
                `Message length ${messageLength} is longer than buffer length ${bytes.length}`,
            );
        }

        this.header.parse(bytes);
        this.message = bytes.subarray(12, messageLength);
        console.log(this.toString());
    }

    static new(id: number): BareMessage {
        const message = new BareMessage(Buffer.alloc(12), 12);
        message.setMessageId(id);
        console.log(`New message: ${message.toString()}`);
        return message;
    }

    static fromBytes(bytes: Buffer, length: number): BareMessage {
        return new BareMessage(bytes, length);
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
        return [
            `ID: ${this.header.getMessageId()}`,
            `Length: ${this.header.getMessageLength()}`,
            `Data: ${this.getDataAsHex()}`,
        ].join(", ");
    }

    toHex(): string {
        return getAsHex(this.toBytes());
    }

    getSize(): number {
        return this.header.getMessageLength();
    }
}
