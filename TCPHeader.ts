import { ISerializedObject, SerializerBase } from "./SerializerBase.js";

export class TCPHeader extends SerializerBase implements ISerializedObject {
    msgid: number;
    msglen: number;
    version: number;
    reserved: number;
    checksum: number;

    constructor() {
        super();
        this.msgid = 0;
        this.msglen = 0;
        this.version = 0;
        this.reserved = 0;
        this.checksum = 0;
    }

    /**
     *
     * @param {Buffer} buf
     */
    static deserialize(buf: Buffer): TCPHeader {
        const header = new TCPHeader();
        header.msgid = header.deserializeWordBE(buf.subarray(0, 2));
        header.msglen = header.deserializeWordBE(buf.subarray(2, 4));
        header.version = header.deserializeWordBE(buf.subarray(4, 6));
        header.reserved = header.deserializeWordBE(buf.subarray(6, 8));
        header.checksum = header.deserializeWordBE(buf.subarray(8, 10));
        return header;
    }

    serialize(): Buffer {
        let buf = Buffer.alloc(0);
        buf = Buffer.concat([buf, this.serializeWordBE(this.msgid)]);
        buf = Buffer.concat([buf, this.serializeWordBE(this.msglen)]);
        buf = Buffer.concat([buf, this.serializeWordBE(this.version)]);
        buf = Buffer.concat([buf, this.serializeWordBE(this.reserved)]);
        buf = Buffer.concat([buf, this.serializeWordBE(this.checksum)]);
        return buf;
    }

    /**
     *
     * @param {Buffer} buf
     * @returns {number}
     */
    deserializeWordBE(buf: Buffer): number {
        return buf.readUInt16BE(0);
    }

    serializeSize(): number {
        return 10;
    }

    serializeWordBE(int16: number): Buffer {
        const buf = Buffer.alloc(2);
        buf.writeUInt16BE(int16);
        return buf;
    }

    toString(): string {
        return `TCPHeader: msgid=${this.msgid}, msglen=${this.msglen}, version=${this.version}, reserved=${this.reserved}, checksum=${this.checksum}`;
    }
}
