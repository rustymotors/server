import { Serializable } from "./BasePacket.js";
import { ISerializable, IMessage } from "./interfaces.js";

/**
 *
 */
export class GameMessageHeader extends Serializable implements ISerializable {
    // Version 0: 4 bytes
    private id: number = 0; // 2 bytes
    private length: number = 0; // 2 bytes

    // Version 1: v0 + 8 bytes
    private version: 0 | 257 = 0; // 2 bytes
    // Padding: 2 bytes (always 0)
    // Length: 4 bytes (same as v0 length)

    constructor(version: 0 | 1) {
        super();
        this.version = version === 0 ? 0 : 257;
    }

    getDataOffset(): number {
        return this.getVersion() === 0 ? 4 : 12;
    }
    override getByteSize(): number {
        return this.getVersion() === 0 ? 4 : 12;
    }

    getVersion(): number {
        return this.version;
    }
    getId(): number {
        return this.id;
    }
    getLength(): number {
        return this.length;
    }
    setVersion(version: 0 | 1): void {
        if (version !== 0 && version !== 1) {
            throw new Error(`Invalid version: ${version}`);
        }
        this.version = version === 0 ? 0 : 257;
    }
    setId(id: number): void {
        this.id = id;
    }
    setLength(length: number): void {
        this.length = length;
    }

    private serializeV0(): Buffer {
        const buffer = Buffer.alloc(this.getByteSize());
        buffer.writeUInt16BE(this.id, 0);
        buffer.writeUInt16BE(this.length, 2);

        return buffer;
    }

    private serializeV1(): Buffer {
        const buffer = Buffer.alloc(this.getByteSize());
        buffer.writeUInt16BE(this.id, 0);
        buffer.writeUInt16BE(this.length, 2);
        buffer.writeUInt16BE(this.version, 4);
        buffer.writeUInt16BE(0, 6);
        buffer.writeUInt32BE(this.length, 8);

        return buffer;
    }

    override serialize(): Buffer {
        return this.version === 0 ? this.serializeV0() : this.serializeV1();
    }

    private deserializeV0(data: Buffer): GameMessageHeader {
        try {
            this.id = data.readUInt16BE(0);
            this.length = data.readUInt16BE(2);
            return this;
        } catch (error) {
            throw Error(
                `Error deserializing v0 header: ${(error as Error).message}`,
            );
        }
    }

    private deserializeV1(data: Buffer): GameMessageHeader {
        try {
            this.id = data.readUInt16BE(0);
            this.length = data.readUInt16BE(2);
            // Skip version
            // Skip padding
            this.length = data.readUInt32BE(8);
            return this;
        } catch (error) {
            throw Error(
                `Error deserializing v1 header: ${(error as Error).message}`,
            );
        }
    }

    override deserialize(data: Buffer): GameMessageHeader {
        this._assertEnoughData(data, this.getByteSize());

        return this.version === 0
            ? this.deserializeV0(data)
            : this.deserializeV1(data);
    }
}

export class GameMessage extends Serializable implements IMessage {
    header: GameMessageHeader;
    data: ISerializable;

    constructor(version: 0 | 1) {
        super();
        this.header = new GameMessageHeader(version);
        this.data = new Serializable();
    }
    getDataBuffer(): Buffer {
        return this.data.serialize();
    }
    setDataBuffer(data: Buffer): void {
        this.data.deserialize(data);
    }
    /** The message length is the length of the message data, not including the id */
    override getByteSize(): number {
        return this.header.getByteSize() + this.data.getByteSize();
    }
    getData(): ISerializable {
        return this.data;
    }
    setData(data: ISerializable): void {
        this.data = data;
    }
    override serialize(): Buffer {
        const buffer = Buffer.alloc(this.getByteSize());
        const headerBuffer = this.header.serialize();
        const dataBuffer = this.getDataBuffer();

        headerBuffer.copy(buffer);
        dataBuffer.copy(buffer, this.header.getDataOffset());
        return buffer;
    }
    override deserialize(data: Buffer): GameMessage {
        this._assertEnoughData(data, this.header.getByteSize());

        this.header.deserialize(data);
        this.setDataBuffer(data.subarray(this.header.getDataOffset()));

        return this;
    }

    override toString(): string {
        return `Id: ${this.header.getId()}, Length: ${this.header.getLength()}, Data: ${this.data.asHexString()}`;
    }

    static identifyVersion(data: Buffer): 0 | 257 {
        if (data.length < 6) {
            return 0;
        }

        const version = data.readUInt16BE(4);
        if (version !== 257) {
            return 0;
        }

        return 257;
    }
}
