import { lessThan } from "./pureCompare.js";
import { getNBytes, getDWord, getAsHex, getWord } from "./pureGet.js";
import { put16, put32 } from "./purePut.js";

export function checkMessageSignature(signatureBytes: Buffer): boolean {
    return signatureBytes.equals(Buffer.from([0x54, 0x4f, 0x4d, 0x43]));
}

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

    toHexString(): string {
        return getAsHex(this.headerBytes);
    }
}

export class ServerMessage {
    private header: ServerHeader;
    private message: Buffer;

    constructor(bytes: Buffer, messageLength: number, id: number) {
        if (lessThan(bytes.length, messageLength)) {
            throw new Error(
                `Message length ${messageLength} is longer than buffer length ${bytes.length}`,
            );
        }

        // Check the signature
        const signatureBytes = bytes.subarray(2, 6);

        if (!checkMessageSignature(signatureBytes)) {
            throw new Error(
                `Invalid message signature: ${getAsHex(signatureBytes)}`,
            );
        }

        this.header = ServerHeader.fromBytes(getNBytes(bytes, 12));
        this.header.setSignature(signatureBytes);

        this.message = getNBytes(bytes, messageLength);
    }

    static fromBytes(bytes: Buffer, messageLength: number): ServerMessage {
        return new ServerMessage(bytes, messageLength, 0);
    }

    isCompressed(): boolean {
        return (this.header.getFlags() & 0x09) === 0x09;
    }

    isEncrypted(): boolean {
        return (this.header.getFlags() & 0x08) === 0x08;
    }

    getData(): Buffer {
        return this.message.subarray(11);
    }

    setData(data: Buffer): void {
        this.message.set(data, 11);
    }

    verifyHeader(): boolean {
        return this.header.toBytes().equals(this.message.subarray(0, 11));
    }

    toBytes(): Buffer {
        if (!this.verifyHeader()) {
            throw new Error(
                `Header does not match message: ${this.header.toHexString()} vs ${getAsHex(
                    this.message.subarray(0, 11),
                )}`,
            );
        }
        return this.message;
    }

    toString(): string {
        return `ServerMessage { header: ${this.header.toString()}, message: ${this.message.toString(
            "hex",
        )} }`;
    }

    getHeader(): ServerHeader {
        return this.header;
    }
}
