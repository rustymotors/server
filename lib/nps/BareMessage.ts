import { lessThan } from "./pureCompare.js";
import { getAsHex, getNBytes, getWord } from "./pureGet.js";
import { put16, put16BE, put32BE } from "./purePut.js";

export interface Message {
    toBytes(): Buffer;
    toString(): string;
    toHex(): string;
    setData(data: Buffer): void;
    getData(): Buffer;
    getSize(): number;
}

export class Header implements Message {
    private headerBytes: Buffer;

    constructor(id: number, length: number, version: number) {
        const headerBytes = Buffer.alloc(12);
        put16BE(headerBytes, 0, id);
        put16BE(headerBytes, 2, length);
        put16BE(headerBytes, 4, version);
        put16BE(headerBytes, 6, 0);
        put32BE(headerBytes, 8, length);
        this.headerBytes = headerBytes;
    }

    static fromBytes(bytes: Buffer): Header {
        if (bytes.length !== 12) {
            throw new Error(
                `Header length ${bytes.length} is not 12 bytes long`,
            );
        }

        const header = new Header(0, 0, 0);
        header.parse(bytes);
        return header;
    }

    parse(bytes: Buffer) {
        if (bytes.length < 12) {
            throw new Error(
                `Header length ${bytes.length} is too short to parse`,
            );
        }

        const headerBytes = Buffer.alloc(12);
        put16BE(headerBytes, 0, getWord(bytes, 0, false));
        put16BE(headerBytes, 2, getWord(bytes, 2, false));
        put16BE(headerBytes, 4, getWord(bytes, 4, false));
        put16BE(headerBytes, 6, getWord(bytes, 6, false));
        put32BE(headerBytes, 8, getWord(bytes, 8, false));
        this.headerBytes = headerBytes;
    }

    getMessageId(): number {
        return getWord(this.headerBytes, 0, false);
    }

    setMessageId(id: number) {
        put16BE(this.headerBytes, 0, id);
    }

    getMessageLength(): number {
        return getWord(this.headerBytes, 2, false);
    }

    setMessageLength(length: number) {
        put16BE(this.headerBytes, 2, length);
        put32BE(this.headerBytes, 8, length);
    }

    toBytes(): Buffer {
        if (this.headerBytes.length < 12) {
            throw new Error(
                `Header length ${this.headerBytes.length} is too short`,
            );
        }
        return this.headerBytes;
    }

    toString(): string {
        return [
            `ID: ${this.getMessageId()}`,
            `Length: ${this.getMessageLength()}`,
        ].join(", ");
    }

    toHex(): string {
        return getAsHex(this.headerBytes);
    }

    getSize(): number {
        return 12;
    }

    setData(data: Buffer): void {
        throw new Error("setData not implemented");
    }

    getData(): Buffer {
        throw new Error("getData not implemented");
    }
}

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
