import { BytableHeader, BytableMessage } from '@rustymotors/binary'; // Ensure this path is correct

/**
 * A NPS message is a message that matches version 1.1 of the nps protocol. It has a 12 byte header. @see {@link NPSHeader}
 *
 * @mixin {SerializableMixin}
 */

export class NPSMessage extends BytableMessage {
    _header: BytableHeader;
    constructor() {
        super();
        this._header = new BytableHeader();
    }

    override deserialize(buffer: Buffer) {
        this._header.deserialize(buffer);
        this.setBody(buffer.subarray(this._header.serializeSize));
        return this;
    }

    override serialize() {
        const buffer = Buffer.alloc(this._header.messageLength);
        this._header.serialize().copy(buffer);
        this.data.copy(buffer, this._header.serializeSize);
        return buffer;
    }

    size() {
        return this._header.serializeSize + this.data.length;
    }

    override toString() {
        return `NPSMessage: ${JSON.stringify({
            header: this._header.toString(),
            data: this.data.toString('hex'),
        })}`;
    }
}
