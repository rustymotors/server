import type { ISerializable } from "../types.js";
import { putLenString } from "../utils/purePut.js";
import { NPSList } from "./NPSList.js";

import { getServerLogger } from "../../shared";

const log = getServerLogger();

const channelRecordSize = 40;

export class MiniRiffInfo implements ISerializable {
    riffName: string; // 32 bytes - max length
    riffId: number; // 4 bytes
    population: number; // 2 bytes

    constructor(riffName: string, riffId: number, population: number) {
        if (riffName.length > 32) {
            throw new Error(`Riff name too long: ${riffName}`);
        }

        this.riffName = riffName;
        this.riffId = riffId;
        this.population = population;
    }

    serialize(): Buffer {
        const buffer = Buffer.alloc(this.getByteSize());
        let offset = 0;
        putLenString(buffer, offset, this.riffName, false);
        offset += 2 + this.riffName.length + 1;
        buffer.writeUInt32BE(this.riffId, offset);
        offset += 4;
        buffer.writeUInt16BE(this.population, offset);
        log.debug(
            `MiniRiffInfo: ${this.toString()} - ${buffer.toString("hex")}`,
        );
        return buffer;
    }
    deserialize(data: Buffer): void {
        throw new Error("Method not implemented.");
    }
    getByteSize(): number {
        return 4 + this.riffName.length + 1 + 4 + 2;
    }
    toString(): string {
        return `MiniRiffInfo(riffName=${this.riffName}, riffId=${this.riffId}, population=${this.population})`;
    }
}

export class MiniRiffList extends NPSList implements ISerializable {
    override serialize(): Buffer {
        return this.toBytes();
    }
    override deserialize(data: Buffer): void {
        throw new Error("Method not implemented.");
    }
    override getByteSize(): number {
        return this.getSize();
    }
    private riffs: MiniRiffInfo[] = [];

    getMaxRiffs(): number {
        return this.riffs.length;
    }

    addRiff(riff: MiniRiffInfo): void {
        this.riffs.push(riff);
    }

    override toBytes(): Buffer {
        const buffer = Buffer.alloc(this.getSize());
        let offset = 0;
        buffer.writeUInt32BE(this.riffs.length, offset);
        offset += 4;
        for (const riff of this.riffs) {
            const riffBuffer = riff.serialize();
            riffBuffer.copy(buffer, offset);
            offset += riff.getByteSize();
        }

        log.debug(
            `MiniRiffList: ${this.toString()} - ${buffer.toString("hex")}`,
        );
        return buffer;
    }
    override toString(): string {
        return `MiniRiffList(riffs=${this.riffs})`;
    }
    override toHex(): string {
        return this.toBytes().toString("hex");
    }

    override getSize(): number {
        let size = 4;
        for (const riff of this.riffs) {
            size += riff.getByteSize();
        }
        return size;
    }
}
