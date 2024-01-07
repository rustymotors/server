import { lessThan } from "./pureCompare.js";
import { getAsHex, getNBytes, getWord } from "./pureGet.js";
import { put16, put16BE, put32BE } from "./purePut.js";

export class Header {
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

        const id = getWord(bytes, 0, false);
        const length = getWord(bytes, 2, false);
        const version = getWord(bytes, 4, false);
        return new Header(id, length, version);
    }

    get messageId(): number {
        return getWord(this.headerBytes, 0, false);
    }

    get messageLength(): number {
        return getWord(this.headerBytes, 2, false);
    }

    toBytes(): Buffer {
        return this.headerBytes;
    }

    toString(): string {
        return [`ID: ${this.messageId}`, `Length: ${this.messageLength}`].join(
            ", ",
        );
    }

    toHex(): string {
        return getAsHex(this.headerBytes);
    }

    get size(): number {
        return this.headerBytes.length;
    }
}

export class BareMessage {
    protected header: Header;
    protected message: Buffer;

    constructor(bytes: Buffer, messageLength: number, id: number) {
        if (lessThan(bytes.length, messageLength)) {
            throw new Error(
                `Message length ${messageLength} is longer than buffer length ${bytes.length}`,
            );
        }

        this.header = Header.fromBytes(getNBytes(bytes, 12));
        this.message = getNBytes(bytes, messageLength);
    }

    static fromBytes(bytes: Buffer, length: number): BareMessage {
        return new BareMessage(bytes, length, 0);
    }

    get messageId(): number {
        return this.header.messageId;
    }

    get messageLength(): number {
        return this.header.messageLength;
    }

    toBytes(): Buffer {
        const remainingBytes = this.messageLength - this.header.size || 0;
        return Buffer.concat([
            this.header.toBytes(),
            getNBytes(this.message, remainingBytes),
        ]);
    }

    toString(): string {
        return [
            `ID: ${this.messageId}`,
            `Length: ${this.messageLength}`,
            `Message: ${getAsHex(this.message)}`,
        ].join(", ");
    }

    toHex(): string {
        return getAsHex(this.toBytes());
    }
}
