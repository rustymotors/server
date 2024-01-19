import { getDWord, getAsHex, getWord } from "../utils/pureGet.js";
import { put16, put32 } from "../utils/purePut.js";

export class ServerHeader {
    private headerBytes: Buffer;

    constructor(messageLength: number, sequence: number, flags: number) {
        this.headerBytes = Buffer.alloc(11);

        put16(this.headerBytes, 0, messageLength, true);

        put32(this.headerBytes, 6, sequence, true);
        this.headerBytes[10] = flags;
    }

    static fromBytes(bytes: Buffer): ServerHeader {
        const messageLength = getWord(bytes, 0, true);
        const sequence = getDWord(bytes, 6, true);
        const flags = bytes[10];

        return new ServerHeader(messageLength, sequence, flags);
    }

    getBytes(): Buffer {
        return this.headerBytes;
    }

    getSequence(): number {
        return getDWord(this.headerBytes, 6, true);
    }

    getFlags(): number {
        return this.headerBytes[10];
    }

    toString(): string {
        return `ServerHeader { messageLength: ${this.getMessageLength()}, sequence: ${this.getSequence()}, flags: ${this.getFlags()} }`;
    }

    getMessageLength(): number {
        return getWord(this.headerBytes, 0, true);
    }

    setMessageLength(messageLength: number): void {
        put16(this.headerBytes, 0, messageLength, true);
    }

    setSequence(sequence: number): void {
        put32(this.headerBytes, 6, sequence, true);
    }

    setFlags(flags: number): void {
        this.headerBytes[10] = flags;
    }

    toBytes(): Buffer {
        return this.headerBytes;
    }

    getSignature(): Buffer {
        return this.headerBytes.subarray(2, 6);
    }

    setSignature(signatureBytes: Buffer): void {
        this.headerBytes.set(signatureBytes, 2);
    }

    toHex(): string {
        return getAsHex(this.headerBytes);
    }

    getSize(): number {
        return 11;
    }
}
