import { getAsHex, getWord } from "../utils/pureGet.js";
import { put16BE } from "../utils/purePut.js";
import { Message } from "../types.js";

export class HeaderV0 implements Message {
    private headerBytes: Buffer;

    constructor(id: number, length: number) {
        const headerBytes = Buffer.alloc(4);
        put16BE(headerBytes, 0, id);
        put16BE(headerBytes, 2, length);
        this.headerBytes = headerBytes;
    }

    static fromBytes(bytes: Buffer): HeaderV0 {
        if (bytes.length < 4) {
            throw new Error(
                `Header length ${bytes.length} is not 4 bytes long`,
            );
        }

        const header = new HeaderV0(0, 0);
        header.parse(bytes);
        return header;
    }

    parse(bytes: Buffer) {
        if (bytes.length < 4) {
            throw new Error(
                `Header length ${bytes.length} is too short to parse`,
            );
        }

        const headerBytes = Buffer.alloc(4);
        put16BE(headerBytes, 0, getWord(bytes, 0, false));
        put16BE(headerBytes, 2, getWord(bytes, 2, false));
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
    }

    toBytes(): Buffer {
        if (this.headerBytes.length < 4) {
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
        return 4;
    }

    setData(data: Buffer): void {
        throw new Error("Method not implemented.");
    }

    getData(): Buffer {
        throw new Error("Method not implemented.");
    }
}
