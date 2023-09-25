/**
 * @module shared/messageFactory
 * @description Holds the base classes for the various message types.
 * The message types are:
 * - LegacyMessage
 * - NPSMessage
 * - ServerMessage
 * - RawMessage
 */

import { ServerError } from "./errors/ServerError.js";

/**
 * @abstract
 */
class AbstractSerializable {
    constructor() {
        if (this.constructor === AbstractSerializable) {
            throw new TypeError(
                "Abstract class 'AbstractSerializable' cannot be instantiated directly.",
            );
        }
    }

    _doSerialize() {
        throw new Error("Method '_doSerialize()' must be implemented.");
    }

    /**
     * @param {Buffer} _buffer
     * @returns {AbstractSerializable}
     */
    // eslint-disable-next-line no-unused-vars
    _doDeserialize(_buffer) {
        throw new Error("Method '_doDeserialize()' must be implemented.");
    }
}

/**
 * @mixin
 * @param {typeof AbstractSerializable} Base
 * @returns {typeof AbstractSerializable}
 */
const SerializableMixin = (Base) =>
    class extends Base {
        constructor() {
            super();
            this._data = Buffer.alloc(0);
        }

        serialize() {
            return this._doSerialize();
        }

        /**
         * @param {Buffer} buffer
         * @returns {AbstractSerializable}
         */
        deserialize(buffer) {
            return this._doDeserialize(buffer);
        }
    };

/**
 * @param {Buffer} buffer
 * @returns {string}
 */
export function deserializeString(buffer) {
    try {
        const stringLength = buffer.readInt32BE(0);
        const stringBuffer = buffer.subarray(4, 4 + (stringLength - 1));

        const string = stringBuffer.toString("utf8").trim();
        return string;
    } catch (error) {
        throw ServerError.fromUnknown(error);
    }
}

/**
 * @param {string} string
 * @returns {Buffer}
 */
export function serializeString(string) {
    const buffer = Buffer.alloc(4 + string.length + 1);
    buffer.writeInt32BE(string.length + 1, 0);
    const stringToWrite = string + "\0";
    buffer.write(stringToWrite, 4, stringToWrite.length, "utf8");
    return buffer;
}

/**
 * A legacy header is a 4 byte header with the following fields:
 * - 2 bytes - id
 * - 2 bytes - length
 *
 *
 */
class legacyHeader extends SerializableMixin(AbstractSerializable) {
    constructor() {
        super();
        this._size = 4;
        this.id = 0; // 2 bytes
        this.length = 0; // 2 bytes
    }

    /**
     * @param {Buffer} buffer
     */
    _doDeserialize(buffer) {
        if (buffer.length < 4) {
            throw new Error(
                `Buffer length ${buffer.length} is too short to deserialize`,
            );
        }

        try {
            this.id = buffer.readInt16BE(0);
            this.length = buffer.readInt16BE(2);
        } catch (error) {
            throw new Error(`Error deserializing buffer: ${String(error)}`);
        }
        return this;
    }

    _doSerialize() {
        const buffer = Buffer.alloc(this._size);
        buffer.writeInt16BE(this.id, 0);
        buffer.writeInt16BE(this.length, 2);
        return buffer;
    }
}

/**
 * A nps header is a 12 byte header with the following fields:
 * - 2 bytes - id
 * - 2 bytes - length
 * - 2 bytes - version
 * - 2 bytes - reserved
 * - 4 bytes - checksum
 *
 * @mixin {SerializableMixin}
 */
class npsHeader extends SerializableMixin(AbstractSerializable) {
    constructor() {
        super();
        this._size = 12;
        this.id = 0; // 2 bytes
        this.length = 0; // 2 bytes
        this.version = 257; // 2 bytes (0x0101)
        this.reserved = 0; // 2 bytes
        this.checksum = 0; // 4 bytes
    }

    /**
     * @param {Buffer} buffer
     * @returns {npsHeader}
     * @throws {Error} If the buffer is too short
     * @throws {Error} If the buffer is malformed
     */
    _doDeserialize(buffer) {
        if (buffer.length < this._size) {
            throw new Error(
                `Buffer length ${buffer.length} is too short to deserialize`,
            );
        }

        try {
            this.id = buffer.readInt16BE(0);
            this.length = buffer.readInt16BE(2);
        } catch (error) {
            throw new Error(`Error deserializing buffer: ${String(error)}`);
        }
        return this;
    }

    _doSerialize() {
        const buffer = Buffer.alloc(this._size);
        buffer.writeInt16BE(this.id, 0);
        buffer.writeInt16BE(this.length, 2);
        buffer.writeInt16BE(this.version, 4);
        buffer.writeInt16BE(this.reserved, 6);
        buffer.writeInt32BE(this.checksum, 8);
        return buffer;
    }
}

/**
 * A server header is an 11 byte header with the following fields:
 * - 2 bytes - length
 * - 4 bytes - mcoSig
 * - 4 bytes - sequence
 * - 1 byte - flags
 *
 *
 */
export class serverHeader extends SerializableMixin(AbstractSerializable) {
    constructor() {
        super();
        this._size = 11;
        this.length = 0; // 2 bytes
        this.mcoSig = 0; // 4 bytes
        this.sequence = 0; // 4 bytes
        this.flags = 0; // 1 byte
    }

    /**
     * @param {Buffer} buffer
     * @returns {serverHeader}
     * @throws {Error} If the buffer is too short
     * @throws {Error} If the buffer is malformed
     */
    _doDeserialize(buffer) {
        if (buffer.length < this._size) {
            throw new Error(
                `Buffer length ${buffer.length} is too short to deserialize`,
            );
        }

        try {
            this.length = buffer.readInt16BE(0);
            this.mcoSig = buffer.readInt32BE(2);
            this.sequence = buffer.readInt32BE(6);
            this.flags = buffer.readInt8(10);
        } catch (error) {
            throw new Error(`Error deserializing buffer: ${String(error)}`);
        }
        return this;
    }

    _doSerialize() {
        const buffer = Buffer.alloc(this._size);
        buffer.writeInt16BE(this.length, 0);
        buffer.writeInt32BE(this.mcoSig, 2);
        buffer.writeInt32BE(this.sequence, 6);
        buffer.writeInt8(this.flags, 10);
        return buffer;
    }
}

/**
 * A legacy message is an older nps message type. It has a 4 byte header. @see {@link legacyHeader}
 *
 * @mixin {SerializableMixin}
 */
export class LegacyMessage extends SerializableMixin(AbstractSerializable) {
    constructor() {
        super();
        this._header = new legacyHeader();
    }

    /**
     * @param {Buffer} buffer
     * @returns {LegacyMessage}
     */
    _doDeserialize(buffer) {
        this._header._doDeserialize(buffer);
        this.data = Buffer.alloc(this._header.length - this._header._size);
        buffer.copy(this.data, 0, this._header._size);
        return this;
    }
}

/**
 * A NPS message is a message that matches version 1.1 of the nps protocol. It has a 12 byte header. @see {@link npsHeader}
 *
 * @mixin {SerializableMixin}
 */
export class NPSMessage extends SerializableMixin(AbstractSerializable) {
    constructor() {
        super();
        this._header = new npsHeader();
    }

    /**
     * @param {Buffer} buffer
     * @returns {NPSMessage}
     */
    _doDeserialize(buffer) {
        this._header._doDeserialize(buffer);
        this.data = Buffer.alloc(this._header.length - this._header._size);
        buffer.copy(this.data, 0, this._header._size);
        return this;
    }
}

/**
 * A server message is a message that is passed between the server and the client. It has an 11 byte header. @see {@link serverHeader}
 *
 * @mixin {SerializableMixin}
 */
export class ServerMessage extends SerializableMixin(AbstractSerializable) {
    constructor() {
        super();
        this._header = new serverHeader();
    }

    /**
     * @param {Buffer} buffer
     * @returns {ServerMessage}
     */
    _doDeserialize(buffer) {
        this._header._doDeserialize(buffer);
        this.data = Buffer.alloc(this._header.length - this._header._size);
        buffer.copy(this.data, 0, this._header._size);
        return this;
    }
}

/**
 * A raw message is a message that is not parsed into a specific type.
 * It has no header, and is just a serialized buffer.
 *
 * @mixin {SerializableMixin}
 */
export class RawMessage extends SerializableMixin(AbstractSerializable) {
    constructor() {
        super();
        this.data = Buffer.alloc(0);
        this.raw = Buffer.alloc(0);
    }

    /**
     * @param {Buffer} buffer
     * @returns {RawMessage}
     */
    _doDeserialize(buffer) {
        this.data = Buffer.alloc(buffer.length);
        buffer.copy(this.data);
        return this;
    }
}
