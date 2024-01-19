import { getAsHex, getWord } from "../utils/pureGet.js";
import { put16BE, put32BE } from "../utils/purePut.js";
import { Message } from "../types.js";

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
