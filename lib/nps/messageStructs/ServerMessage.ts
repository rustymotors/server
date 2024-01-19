import { Message } from "../types.js";
import { lessThan } from "../utils/pureCompare.js";
import { getNBytes, getAsHex } from "../utils/pureGet.js";
import { ServerHeader } from "./ServerHeader.js";

export function checkMessageSignature(signatureBytes: Buffer): boolean {
    return signatureBytes.equals(Buffer.from([0x54, 0x4f, 0x4d, 0x43]));
}

export class ServerMessage implements Message {
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
                `Header does not match message: ${getAsHex(
                    this.header.toBytes(),
                )} != ${getAsHex(this.message.subarray(0, 11))}`,
            );
        }
        return this.message;
    }

    toString(): string {
        return `ServerMessage { header: ${this.header.toString()}, message: ${this.message.toString(
            "hex",
        )} }`;
    }

    toHex(): string {
        return getAsHex(this.message);
    }

    getHeader(): ServerHeader {
        return this.header;
    }

    getSize(): number {
        return this.message.length;
    }
}
