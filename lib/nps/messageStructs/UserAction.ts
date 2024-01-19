import { Message } from "../types.js";
import { getAsHex } from "../utils/pureGet.js";

export class UserAction implements Message {
    private name: string;
    private data: Buffer = Buffer.alloc(0);

    constructor(name: string, bytes?: Buffer) {
        this.name = name;
        if (bytes) {
            this.data = bytes;
        }
    }
    setData(data: Buffer): void {
        throw new Error("Method not implemented.");
    }
    getData(): Buffer {
        throw new Error("Method not implemented.");
    }

    static fromBytes(name: string, bytes: Buffer): UserAction {
        const dara = bytes.toString("utf8");

        return new UserAction(name, bytes);
    }

    toBytes(): Buffer {
        return Buffer.from(this.name, "utf8");
    }
    toString(): string {
        return this.name;
    }
    toHex(): string {
        return getAsHex(this.toBytes());
    }

    getSize(): number {
        return this.name.length;
    }
}
