import type { ISerializable } from "../types.js";
import { getAsHex } from "../utils/pureGet.js";

export class SessionKey implements ISerializable {
    private key: Buffer;
    private timestamp: number;

    constructor(key: Buffer, timestamp: number) {
        this.key = key;
        this.timestamp = timestamp;
    }
    serialize(): Buffer {
        throw new Error("Method not implemented.");
    }
    deserialize(data: Buffer): void {
        throw new Error("Method not implemented.");
    }
    getByteSize(): number {
        throw new Error("Method not implemented.");
    }

    static fromBytes(bytes: Buffer): SessionKey {
        const keyLength = bytes.readUInt16BE(0);

        // Set the data offset
        let dataOffset = 2 + keyLength;

        const key = bytes.subarray(2, dataOffset);

        // Get the timestamp
        const timestamp = bytes.readUInt32BE(dataOffset);

        return new SessionKey(key, timestamp);
    }

    static fromKeyString(key: string): SessionKey {
        const keyBuffer = Buffer.from(key, "hex");

        return new SessionKey(keyBuffer, 0);
    }

    getKey(): string {
        return this.key.toString("hex");
    }

    toString(): string {
        return `SessionKey(key=${this.getKey()}, timestamp=${this.timestamp})`;
    }

    toHex(): string {
        return getAsHex(this.toBytes());
    }

    toBytes(): Buffer {
        const keyLength = this.key.length;
        const timestamp = this.timestamp;

        const buffer = Buffer.alloc(2 + keyLength + 4);

        buffer.writeUInt16BE(keyLength, 0);
        this.key.copy(buffer, 2);
        buffer.writeUInt32BE(timestamp, 2 + keyLength);

        return buffer;
    }

    getSize(): number {
        return this.key.length + 6;
    }

    getData(): Buffer {
        throw new Error("Method not implemented.");
    }

    setData(data: Buffer): void {
        throw new Error("Method not implemented.");
    }
}
