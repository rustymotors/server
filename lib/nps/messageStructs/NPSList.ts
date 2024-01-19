import { Message } from "../types.js";

export class NPSList implements Message {
    private list: Message[] = [];

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
