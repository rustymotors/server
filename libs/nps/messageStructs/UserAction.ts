import type { ISerializable } from "../types.js";
import { getAsHex } from "../utils/pureGet.js";

export class UserAction implements ISerializable {
    private name: string;
    private data: Buffer = Buffer.alloc(0);

    constructor(name: string, bytes?: Buffer) {
        this.name = name;
        if (bytes) {
            this.data = bytes;
        }
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
    setData(data: Buffer): void {
        throw new Error("Method not implemented.");
    }
    getData(): Buffer {
        throw new Error("Method not implemented.");
    }

    static fromBytes(name: string, bytes: Buffer): UserAction {
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
