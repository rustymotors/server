import { Serializable } from "./BasePacket.js";
import { ISerializable, IMessage } from "./interfaces.js";

/**
 *
 */
export class ServerMessageHeader extends Serializable implements ISerializable {
    // All fields are little-endian
    private length: number = 0; // 2 bytes
    private signature: string = ""; // 4 bytes
    private sequence: number = 0; // 4 bytes
    private flags: number = 0; // 1

    getDataOffset(): number {
        return 11;
    }
    override getByteSize(): number {
        return 11;
    }

    getLength(): number {
        return this.length;
    }

    override serialize(): Buffer {
        const buffer = Buffer.alloc(this.getByteSize());
        buffer.writeUInt16LE(this.length, 0);
        buffer.write(this.signature, 2, 4, "ascii");
        buffer.writeUInt32LE(this.sequence, 6);
        buffer.writeUInt8(this.flags, 10);

        return buffer;
    }

    override deserialize(data: Buffer): ServerMessageHeader {
        this._assertEnoughData(data, this.getByteSize());

        this.length = data.readUInt16LE(0);
        this.signature = data.toString("utf8", 2, 6);
        this.sequence = data.readUInt32LE(6);
        this.flags = data.readUInt8(10);

        return this;
    }

    isValidSignature(): boolean {
        return this.signature === "TOMC";
    }

    isPayloadEncrypted(): boolean {
        // Does the flags bitmask contain have 0x08 set?
        return this.flags >= 0x08;
    }

    togglePayloadEncryption(): ServerMessageHeader {
        this.flags ^= 0x08;
        return this;
    }
}

export class ServerMessagePayload
    extends Serializable
    implements ISerializable
{
    private messageId: number = 0; // 2 bytes

    override getByteSize(): number {
        return 2 + this._data.length;
    }

    override serialize(): Buffer {
        const buffer = Buffer.alloc(this.getByteSize());
        buffer.writeUInt16LE(this.messageId, 0);
        this._data.copy(buffer, 2);

        return buffer;
    }

    override deserialize(data: Buffer): ServerMessagePayload {
        this._assertEnoughData(data, 2);

        this.messageId = data.readUInt16LE(0);
        this._data = data.subarray(2);

        return this;
    }

    getMessageId(): number {
        return this.messageId;
    }

    setMessageId(messageId: number): ServerMessagePayload {
        this.messageId = messageId;
        return this;
    }
}

export class ServerMessage extends Serializable implements IMessage {
    header: ServerMessageHeader;
    data: ServerMessagePayload;

    constructor(messageId: number) {
        super();
        this.header = new ServerMessageHeader();
        this.data = new ServerMessagePayload().setMessageId(messageId);
    }
    getDataBuffer(): Buffer {
        return this.data.serialize();
    }
    setDataBuffer(data: Buffer): ServerMessage {
        this.data.deserialize(data);
        return this;
    }
    /** The message length is the length of the message data, not including the id */
    override getByteSize(): number {
        return this.header.getByteSize() + this.data.getByteSize();
    }
    getData(): ISerializable {
        return this.data;
    }
    setData(data: ServerMessagePayload): ServerMessage {
        this.data = data;
        return this;
    }
    override serialize(): Buffer {
        const buffer = Buffer.alloc(this.getByteSize());
        const headerBuffer = this.header.serialize();
        const dataBuffer = this.getDataBuffer();

        headerBuffer.copy(buffer);
        dataBuffer.copy(buffer, this.header.getDataOffset());

        return buffer;
    }
    override deserialize(data: Buffer): ServerMessage {
        this._assertEnoughData(data, this.header.getByteSize());

        this.header.deserialize(data);
        this.setDataBuffer(data.subarray(this.header.getDataOffset()));

        return this;
    }
}
