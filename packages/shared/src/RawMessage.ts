/**
 * Minimal wire-serializable NPS message for use with BytableMessage.FromRawMessage.
 * Produces: [id:2 BE][totalLen:2 BE][data]
 */
export class RawMessage {
    id: number = 0;
    data: Buffer = Buffer.alloc(0);
    length: number = 0;

    serialize(): Buffer {
        const totalLen = 4 + this.data.byteLength;
        const buf = Buffer.alloc(totalLen);
        buf.writeUInt16BE(this.id, 0);
        buf.writeUInt16BE(totalLen, 2);
        this.data.copy(buf, 4);
        return buf;
    }
}
