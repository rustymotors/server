import { get } from "http";
import { getAsHex, getNBytes } from "./pureGet.js";
import { Message } from "./BareMessage.js";

export class MessageContainer implements Message {
    private id: number;
    private length: number;
    private message = Buffer.alloc(4);

    constructor(id: number, length: number, message?: Buffer) {
        this.id = id;
        this.length = length;
        if (message) {
            if (message.length !== length) {
                throw new Error(
                    `Message length ${message.length} does not match expected length ${length}`,
                );
            }

            this.message = getNBytes(message, length);
        }
    }

    static fromBytes(bytes: Buffer): MessageContainer {
        const id = bytes.readUInt16BE(0);
        const length = bytes.readUInt16BE(2);

        return new MessageContainer(id, length, bytes);
    }

    getMessageId(): number {
        return this.id;
    }

    getMessageLength(): number {
        return this.length;
    }

    syncId() {
        this.message.writeUInt16BE(this.id, 0);
    }

    syncLength() {
        this.message.writeUInt16BE(this.length, 2);
    }

    toBytes(): Buffer {
        this.syncId();
        this.syncLength();

        return this.message;
    }

    getData(): Buffer {
        if (this.message.length <= 4) {
            return Buffer.alloc(0);
        }
        return this.message.subarray(4);
    }

    setData(data: Buffer) {
        this.message = Buffer.concat([this.message.subarray(0, 4), data]);
        this.length = this.message.length;
    }

    toString(): string {
        return `ID: ${this.id}, Length: ${this.length}, Content: ${getAsHex(
            this.getData(),
        )}`;
    }

    toHex(): string {
        return getAsHex(this.message);
    }

    getSize(): number {
        return this.length;
    }
}
