class PacketHeader {
    public msgId: Buffer; // 2 int8s = 2 bytes
    public msgLen: Buffer; // 2 int8s = 2 bytes - total length of packet, including header
    public msgVersion: Buffer; // 2 int8s = 2 bytes
    public reserved: Buffer; // 2 int8s = 2 bytes
    public sequence: Buffer; // 2 int8s = 2 bytes

    constructor() {
        this.msgId = Buffer.alloc(2);
        this.msgLen = Buffer.alloc(2);
        this.msgVersion = Buffer.alloc(2);
        this.reserved = Buffer.alloc(2);
        this.sequence = Buffer.alloc(2); // also known as "checksum"
    }

    static fromBuffer(buffer: Buffer): PacketHeader {
        const header = new PacketHeader();
        buffer.copy(header.msgId, 0, 0, 2);
        buffer.copy(header.msgLen, 0, 2, 4);
        buffer.copy(header.msgVersion, 0, 4, 6);
        buffer.copy(header.reserved, 0, 6, 8);
        buffer.copy(header.sequence, 0, 8, 10);
        return header;
    }

    static fromHeader(header: PacketHeader): PacketHeader {
        const newHeader = new PacketHeader();
        newHeader.msgId = Buffer.from(header.msgId);
        newHeader.msgLen = Buffer.from(header.msgLen);
        newHeader.msgVersion = Buffer.from(header.msgVersion);
        newHeader.reserved = Buffer.from(header.reserved);
        newHeader.sequence = Buffer.from(header.sequence);
        return newHeader;
    }

    serialize(): Buffer {
        const buffer = Buffer.alloc(10);
        this.msgId.copy(buffer, 0, 0, 2);
        this.msgLen.copy(buffer, 2, 0, 2);
        this.msgVersion.copy(buffer, 4, 0, 2);
        this.reserved.copy(buffer, 6, 0, 2);
        this.sequence.copy(buffer, 8, 0, 2);
        return buffer;
    }
}

export class Packet {
    public header: PacketHeader;

    constructor({ id = 0, version = 0 }: { id: number; version: number }) {
        this.header = new PacketHeader();
        this.header.msgId.writeInt16BE(id);
        this.header.msgVersion.writeInt16BE(version);
    }

    serialize(): Buffer {
        return this.header.serialize();
    }

    deserialize(buffer: Buffer): void {
        this.header = PacketHeader.fromBuffer(buffer);
    }

    get id(): number {
        return this.header.msgId.readInt16BE();
    }

    get version(): number {
        return this.header.msgVersion.readInt16BE();
    }

    set id(id: number) {
        this.header.msgId.writeInt16BE(id);
    }

    set version(version: number) {
        this.header.msgVersion.writeInt16BE(version);
    }

    get sequence(): number {
        return this.header.sequence.readInt16BE();
    }

    set sequence(sequence: number) {
        this.header.sequence.writeInt16BE(sequence);
    }

    get length(): number {
        return this.header.msgLen.readInt16BE();
    }
}
