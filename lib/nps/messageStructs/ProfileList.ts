import { Message } from "../types.js";
import { NPSList } from "./NPSList.js";

export class ProfileList extends NPSList implements Message {
    maxProfiles = 0; // 1 byte

    getMaxProfiles(): number {
        return this.maxProfiles;
    }

    override toBytes(): Buffer {
        const buffer = Buffer.alloc(this.getSize());
        buffer.writeUInt16BE(this.maxProfiles, 0);
        return buffer;
    }
    override toString(): string {
        throw new Error("Method not implemented.");
    }
    override toHex(): string {
        throw new Error("Method not implemented.");
    }
    override setData(data: Buffer): void {
        throw new Error("Method not implemented.");
    }
    override getData(): Buffer {
        throw new Error("Method not implemented.");
    }

    override getSize(): number {
        return super.getSize() + 2;
    }
}
