import { SerializedValue, Serializer } from "./MessageNode.js";

export class TCPHeader extends Serializer {
    constructor() {
        super();
        this.fields = [
            new SerializedValue("msgid", this.deserializeWordBE, 0),
            new SerializedValue("msglen", this.deserializeWordBE, 0),
            new SerializedValue("version", this.deserializeWordBE, 0),
            new SerializedValue("reserved", this.deserializeWordBE, 0),
            new SerializedValue("checksum", this.deserializeWordBE, 0)
        ];
    }

    /**
     * 
     * @param {Buffer} buf 
     */
    deserialize(buf) {
        this.findField("msgid").value = this.deserializeWordBE(buf.subarray(0, 2));
        this.findField("msglen").value = this.deserializeWordBE(buf.subarray(2, 4));
        this.findField("version").value = this.deserializeWordBE(buf.subarray(4, 6));
        this.findField("reserved").value = this.deserializeWordBE(buf.subarray(6, 8));
        this.findField("checksum").value = this.deserializeWordBE(buf.subarray(8, 10));
    }

    deserializeWordBE(buf) {
        return buf.readUInt16BE(0);
    }

    toString() {
        return `TCPHeader: msgid: ${this.findField("msgid").value}, msglen: ${this.findField("msglen").value}, version: ${this.findField("version").value}, reserved: ${this.findField("reserved").value}, checksum: ${this.findField("checksum").value}`;
    }

}

