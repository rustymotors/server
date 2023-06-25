import { ISerializedObject, ITCPHeader } from "./interfaces.js";
import { SerializerBase } from "./SerializerBase.js";

export class TCPHeader extends SerializerBase implements ITCPHeader {
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
    deserialize(buf: Buffer): ITCPHeader {
        if (buf.length < 10) {
            throw new Error("TCPHeader.deserialize: buf.length < 10");
        }

        const header: ITCPHeader = new TCPHeader();
        header.msgid = SerializerBase.deserializeWordBE(buf.subarray(0, 2));
        header.msglen = SerializerBase.deserializeWordBE(buf.subarray(2, 4));
        header.version = SerializerBase.deserializeWordBE(buf.subarray(4, 6));
        header.reserved = SerializerBase.deserializeWordBE(buf.subarray(6, 8));
        header.checksum = SerializerBase.deserializeWordBE(buf.subarray(8, 10));
        return header;
    }

    serialize(): Buffer {
        let buf = Buffer.alloc(0);
        buf = Buffer.concat([buf, SerializerBase.serializeWordBE(this.msgid)]);
        buf = Buffer.concat([buf, SerializerBase.serializeWordBE(this.msglen)]);
        buf = Buffer.concat([
            buf,
            SerializerBase.serializeWordBE(this.version),
        ]);
        buf = Buffer.concat([
            buf,
            SerializerBase.serializeWordBE(this.reserved),
        ]);
        buf = Buffer.concat([
            buf,
            SerializerBase.serializeWordBE(this.checksum),
        ]);
        return buf;
    }

    serializeSize(): number {
        return 10;
    }

    toString(): string {
        return `TCPHeader: msgid=${this.msgid}(${this.msgid.toString(
            16
        )}), msglen=${this.msglen}, version=${this.version}, reserved=${
            this.reserved
        }, checksum=${this.checksum}`;
    }
}
