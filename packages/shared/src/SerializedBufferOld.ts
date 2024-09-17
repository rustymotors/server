import { SerializableMixin, AbstractSerializable } from "./messageFactory.js";

/**
 * A raw message is a message that is not parsed into a specific type.
 * It has no header, and is just a serialized buffer.
 *
 * @mixin {SerializableMixin}
 */

export class SerializedBufferOld extends SerializableMixin(
    AbstractSerializable,
) {
    constructor() {
        super();
    }

    /**
     * @param {Buffer} buffer
     * @returns {SerializedBufferOld}
     */
    override _doDeserialize(buffer: Buffer): SerializedBufferOld {
        this.setBuffer(buffer);
        return this;
    }

    serialize() {
        return this.data;
    }

    override toString() {
        return `SerializedBuffer: ${this.serialize().toString("hex")}`;
    }

    size() {
        return this.data.length;
    }
}
