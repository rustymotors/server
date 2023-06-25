import { ITCPHeader, ITCPMessage } from "./interfaces.js";
import { SerializerBase } from "./SerializerBase.js";
import { TCPHeader } from "./TCPHeader.js";

export class TCPMessage extends SerializerBase {
    connectionId: string | null = null;
    toFrom: number;
    appId: number;
    _header: ITCPHeader | null = null;
    buffer: Buffer;

    get header(): ITCPHeader {
        if (!this._header) {
            throw new Error("TCPMessage.Header: header is null");
        }
        return this._header;
    }

    set header(value: TCPHeader) {
        this._header = value;
    }

    /**
     *
     * @param {Buffer} buf
     */
    static deserialize(buf: Buffer): ITCPMessage {
        const message = new TCPMessage();
        message.header = TCPHeader.deserialize(buf.subarray(0, 10));
        message.buffer = buf.subarray(10);
        return message;
    }

    constructor() {
        super();
        this.connectionId = null;
        this.toFrom = 0;
        this.appId = 0;
        this.header = new TCPHeader();
        this.buffer = Buffer.alloc(0);
    }

    serialize(): Buffer {
        SerializerBase.verifyConnectionId(this);
        let buf = Buffer.alloc(0);
        buf = Buffer.concat([buf, this.header.serialize()]);
        buf = Buffer.concat([buf, this.buffer]);
        return buf;
    }

    serializeSize(): number {
        SerializerBase.verifyConnectionId(this);
        return this.header.serializeSize() + this.buffer.length;
    }

    toString(): string {
        SerializerBase.verifyConnectionId(this);
        return `TCPMessage: toFrom=${this.toFrom}, appId=${
            this.appId
        }, length=${this.buffer.length}, msgid=${
            this.header.msgid
        }(${this.header.msgid.toString(16)}), msglen=${
            this.header.msglen
        }, buffer=${this.buffer.toString("hex")}`;
    }
}
