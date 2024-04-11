import type { ISerializable, IMessage } from "../types.js";

export class NPSList implements ISerializable {
    serialize(): Buffer {
        throw new Error("Method not implemented.");
    }
    deserialize(data: Buffer): void {
        throw new Error("Method not implemented.");
    }
    getByteSize(): number {
        throw new Error("Method not implemented.");
    }
    private list: IMessage[] = [];

    toBytes(): Buffer {
        throw new Error("Method not implemented.");
    }
    toString(): string {
        throw new Error("Method not implemented.");
    }
    toHex(): string {
        throw new Error("Method not implemented.");
    }
    setData(data: Buffer): void {
        throw new Error("Method not implemented.");
    }
    getData(): Buffer {
        throw new Error("Method not implemented.");
    }

    getSize(): number {
        return 0;
    }
}
