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
 * @property {Buffer} data
 * @property {number} Size
 */
class AbstractSerializable {
    constructor() {
        if (this.constructor === AbstractSerializable) {
            throw new TypeError(
                "Abstract class 'AbstractSerializable' cannot be instantiated directly.",
            );
        }
        /** @private */
        this.internalBuffer = Buffer.alloc(0);
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

    get data() {
        return this.internalBuffer;
    }

    /**
     * @param {Buffer} buffer
     */
    setBuffer(buffer) {
        this.internalBuffer = Buffer.alloc(buffer.length);
        this.internalBuffer = buffer;
    }

    /**
     * @returns {number}
     */
    static get Size() {
        throw new Error("Method 'Size' must be implemented.");
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
        throw ServerError.fromUnknown(
            error,
            `Error deserializing string from buffer ${buffer.toString("hex")}`,
        );
    }
}

/**
 * @param {string} string
 * @param {Buffer} targetBuffer
 * @param {number} offset
 * @returns {number}
 */
export function serializeString(string, targetBuffer, offset) {
    const buffer = Buffer.alloc(4 + string.length + 1);
    buffer.writeInt32BE(string.length + 1, 0);
    const stringToWrite = string + "\0";
    buffer.write(stringToWrite, 4, stringToWrite.length, "utf8");
    buffer.copy(targetBuffer, offset);
    offset += buffer.length;
    return offset;
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
        this.length = this._size; // 2 bytes
    }

    /**
     * @param {Buffer} buffer
     */
    _doDeserialize(buffer) {
        if (buffer.length < 4) {
            throw new ServerError(
                `Buffer length ${buffer.length} is too short to deserialize`,
            );
        }

        try {
            this.id = buffer.readInt16BE(0);
            this.length = buffer.readInt16BE(2);
        } catch (error) {
            throw new ServerError(
                `Error deserializing buffer: ${String(error)}`,
            );
        }
        return this;
    }

    _doSerialize() {
        const buffer = Buffer.alloc(this._size);
        buffer.writeInt16BE(this.id, 0);
        buffer.writeInt16BE(this.length, 2);
        return buffer;
    }

    toString() {
        return `LegacyHeader: ${JSON.stringify({
            id: this.id,
            length: this.length,
        })}`;
    }

    static get Size() {
        return 4;
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
export class NPSHeader extends SerializableMixin(AbstractSerializable) {
    constructor() {
        super();
        this._size = 12;
        this.id = 0; // 2 bytes
        this.length = this._size; // 2 bytes
        this.version = 257; // 2 bytes (0x0101)
        this.reserved = 0; // 2 bytes
        this.checksum = 0; // 4 bytes
    }

    /**
     * @param {Buffer} buffer
     * @returns {NPSHeader}
     * @throws {Error} If the buffer is too short
     * @throws {Error} If the buffer is malformed
     */
    _doDeserialize(buffer) {
        if (buffer.length < this._size) {
            throw new ServerError(
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

    static size() {
        return 12;
    }

    static get Size() {
        return 12;
    }

    toString() {
        return `NPSHeader: ${JSON.stringify({
            id: this.id,
            length: this.length,
            version: this.version,
            reserved: this.reserved,
            checksum: this.checksum,
        })}`;
    }
}

/**
 * A server header is an 11 byte header with the following fields:
 * - 2 bytes - length
 * - 4 bytes - mcoSig
 * - 4 bytes - sequence
 * - 1 byte - flags
 */
export class serverHeader extends SerializableMixin(AbstractSerializable) {
    constructor() {
        super();
        this._size = 11;
        this.length = this._size; // 2 bytes
        this.mcoSig = "TOMC"; // 4 bytes
        this.sequence = 0; // 4 bytes
        this.flags = 0; // 1 byte
    }

    size() {
        return this._size;
    }

    /**
     * @param {Buffer} buffer
     * @returns {serverHeader}
     * @throws {Error} If the buffer is too short
     * @throws {Error} If the buffer is malformed
     */
    _doDeserialize(buffer) {
        if (buffer.length < this._size) {
            throw new ServerError(
                `Buffer length ${buffer.length} is too short to deserialize`,
            );
        }

        try {
            this.length = buffer.readInt16LE(0);
            this.mcoSig = buffer.toString("utf8", 2, 6);
            this.sequence = buffer.readInt32LE(6);
            this.flags = buffer.readInt8(10);
        } catch (error) {
            throw new Error(`Error deserializing buffer: ${String(error)}`);
        }
        return this;
    }

    _doSerialize() {
        const buffer = Buffer.alloc(this._size);
        buffer.writeInt16LE(this.length, 0);
        buffer.write(this.mcoSig, 2, 6, "utf8");
        buffer.writeInt32LE(this.sequence, 6);
        buffer.writeInt8(this.flags, 10);
        return buffer;
    }

    toString() {
        return `ServerHeader: ${JSON.stringify({
            length: this.length,
            mcoSig: this.mcoSig,
            sequence: this.sequence,
            flags: this.flags,
        })}`;
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
        this.setBuffer(buffer.subarray(this._header._size));
        return this;
    }

    _doSerialize() {
        const buffer = Buffer.alloc(this._header.length);
        this._header._doSerialize().copy(buffer);
        super.data.copy(buffer, this._header._size);
        return buffer;
    }

    serialize() {
        return this._doSerialize();
    }

    /**
     * @param {Buffer} buffer
     */
    setBuffer(buffer) {
        super.setBuffer(buffer);
        this._header.length = buffer.length + 4;
    }

    asJSON() {
        return {
            header: this._header,
            data: super.data.toString("hex"),
        };
    }

    toString() {
        return `LegacyMessage: ${JSON.stringify({
            header: this._header.toString(),
            data: super.data.toString("hex"),
        })}`;
    }
}

/**
 * A NPS message is a message that matches version 1.1 of the nps protocol. It has a 12 byte header. @see {@link NPSHeader}
 *
 * @mixin {SerializableMixin}
 */
export class NPSMessage extends SerializableMixin(AbstractSerializable) {
    constructor() {
        super();
        this._header = new NPSHeader();
    }

    /**
     * @param {Buffer} buffer
     * @returns {NPSMessage}
     */
    _doDeserialize(buffer) {
        this._header._doDeserialize(buffer);
        this.setBuffer(buffer.subarray(this._header._size));
        return this;
    }

    serialize() {
        const buffer = Buffer.alloc(this._header.length);
        this._header._doSerialize().copy(buffer);
        this.data.copy(buffer, this._header._size);
        return buffer;
    }

    toString() {
        return `NPSMessage: ${JSON.stringify({
            header: this._header.toString(),
            data: this.data.toString("hex"),
        })}`;
    }
}

/**
 * A raw message is a message that is not parsed into a specific type.
 * It has no header, and is just a serialized buffer.
 *
 * @mixin {SerializableMixin}
 */
export class SerializedBuffer extends SerializableMixin(AbstractSerializable) {
    constructor() {
        super();
    }

    /**
     * @param {Buffer} buffer
     * @returns {SerializedBuffer}
     */
    _doDeserialize(buffer) {
        this.setBuffer(buffer);
        return this;
    }

    serialize() {
        return this.data;
    }

    toString() {
        return `SerializedBuffer: ${this.data.toString("hex")}`;
    }

    size() {
        return this.data.length;
    }
}

/**
 * A list message is a message that contains a list of items of a specific type.
 *
 * @mixin {SerializableMixin}
 */
export class ListMessage extends SerializedBuffer {
    constructor() {
        super();
        this._msgNo = 0; // 2 bytes
        this._listCount = 0; // 2 bytes
        this._shouldExpectMoreMessages = false; // 1 byte
        /** @type {SerializedBuffer[]} */
        this._list = []; // this.itemsType bytes each
    }

    /**
     * @param {SerializedBuffer} item
     */
    add(item) {
        this._list.push(item);
        this._listCount++;
    }

    serialize() {
        let neededSize;
        if (this._list.length === 0) {
            neededSize = 5;
        } else {
            neededSize = 5 + this._list.length * this._list[0].size();
        }
        const buffer = Buffer.alloc(neededSize);
        let offset = 0; // offset is 0
        buffer.writeUInt16BE(this._msgNo, offset);
        offset += 2; // offset is 2
        buffer.writeInt8(this._listCount, offset);
        offset += 1; // offset is 3
        buffer.writeUInt8(this._shouldExpectMoreMessages ? 1 : 0, offset);
        offset += 1; // offset is 4
        for (const item of this._list) {
            item.serialize().copy(buffer, offset);
            offset += item.size();
        }
        // offset is now 4 + this._list.length * this._list[0].size()
        return buffer;
    }

    size() {
        return 5 + this._list.length * this._list[0].size();
    }

    toString() {
        return `ListMessage: msgNo=${this._msgNo} listCount=${this._listCount} shouldExpectMoreMessages=${this._shouldExpectMoreMessages} list=${this._list}`;
    }
}

export class MessageHeader extends SerializedBuffer {
    constructor() {
        super();
        this._size = 4;
        this._messageId = 0; // 4 bytes
        this._messageLength = 0; // 4 bytes
    }

    get messageId() {
        return this._messageId;
    }

    get messageLength() {
        return this._messageLength;
    }

    serializeSizeOf() {
        return this._size;
    }

    size() {
        return this._size;
    }

    get id() {
        return this._messageId;
    }

    get length() {
        return this._messageLength;
    }

    /**
     * @param {Buffer} buffer
     * @returns {MessageHeader}
     */
    deserialize(buffer) {
        this._messageId = buffer.readInt16BE(0);
        this._messageLength = buffer.readInt16BE(2);
        return this;
    }

    serialize() {
        const buffer = Buffer.alloc(4);
        buffer.writeInt16BE(this._messageId, 0);
        buffer.writeInt16BE(this._messageLength, 2);
        return buffer;
    }

    /**
     * @param {Buffer} buffer
     * @returns {MessageHeader}
     */
    _doDeserialize(buffer) {
        return this.deserialize(buffer);
    }

    _doSerialize() {
        return this.serialize();
    }

    toString() {
        return `MessageHeader: ${JSON.stringify({
            messageId: this._messageId,
            messageLength: this._messageLength,
        })}`;
    }
}

export class MessageBuffer extends SerializedBuffer {
    constructor() {
        super();
        this._header = new MessageHeader();
        this._buffer = Buffer.alloc(4);
    }

    /**
     * @param {number} id - The ID of the message
     * @param {Buffer} buffer - The buffer to deserialize
     * @returns {MessageBuffer}
     */
    static createGameMessage(id, buffer) {
        const message = new MessageBuffer();
        message._header._messageId = id;
        message.buffer = buffer;
        return message;
    }

    get messageId() {
        return this._header.messageId;
    }

    get messageLength() {
        return this._header.messageLength;
    }

    get data() {
        return this._buffer;
    }

    set data(buffer) {
        this.buffer = buffer;
    }

    /**
     * @param {Buffer} buffer
     */
    set buffer(buffer) {
        // const log = getServerLogger({ module: "MessageBuffer" });
        // log.level = getServerConfiguration({}).logLevel ?? "info";

        this._buffer = Buffer.alloc(buffer.length);
        this._buffer = buffer;
        this._header._messageLength = 4 + buffer.length;
        // log.debug(`Message length: ${this._header._messageLength}`);
        // log.debug(`Buffer length: ${this._buffer.length}`);
        // Pad the buffer to a multiple of 8 bytes
        // let extraBytes = 0;
        // const x = (this._buffer.length + 4) % 8;
        // extraBytes = 8 - x;
        // log.debug(`Extra bytes: ${extraBytes}`);
        // if (extraBytes !== 0) {
        //     this._buffer = Buffer.concat([
        //         this._buffer,
        //         Buffer.alloc(extraBytes),
        //     ]);
        //     log.debug(`Buffer length: ${this._buffer.length}`);
        this._header._messageLength = this._buffer.length + 4;
        // log.debug(`Message length: ${this._header._messageLength}`);
        // }
    }

    /** @param {Buffer} buffer */
    setBuffer(buffer) {
        return (this.buffer = buffer);
    }

    get buffer() {
        return this._buffer;
    }

    serializeSizeOf() {
        return 4 + this._buffer.length;
    }

    /**
     * @param {Buffer} buffer
     * @returns {MessageBuffer}
     */
    deserialize(buffer) {
        this._header.deserialize(buffer.subarray(0, 8));
        if (buffer.length < 4 + this._header.messageLength) {
            throw new ServerError(
                `Buffer length ${buffer.length} is too short to deserialize`,
            );
        }
        this.buffer = buffer.subarray(4);
        return this;
    }

    serialize() {
        const buffer = Buffer.alloc(4 + this._buffer.length);
        if (this.buffer.length < 0) {
            throw new ServerError(
                `Buffer length ${this.buffer.length} is too short to serialize`,
            );
        }
        if (this.messageId <= 0) {
            throw new ServerError(
                `Message ID ${this.messageId} is invalid to serialize`,
            );
        }
        this._header.serialize().copy(buffer);
        this._buffer.copy(buffer, 4);
        return buffer;
    }

    toString() {
        return `MessageBuffer: ${JSON.stringify({
            header: this._header.toString(),
            bufferLength: this._buffer.length,
            buffer: this._buffer.toString("hex"),
        })}`;
    }

    asJSON() {
        return {
            header: this._header,
            buffer: this._buffer.toString("hex"),
        };
    }
}

/**
 * A server message is a message that is passed between the server and the client. It has an 11 byte header. @see {@link serverHeader}
 *
 * @mixin {SerializableMixin}
 */
export class ServerMessage extends SerializedBuffer {
    constructor() {
        super();
        this._header = new serverHeader();
        this._msgNo = 0; // 2 bytes
    }

    /**
     * @param {Buffer} buffer
     * @returns {ServerMessage}
     */
    _doDeserialize(buffer) {
        this._header._doDeserialize(buffer);
        this.setBuffer(buffer.subarray(this._header._size));
        if (this.data.length > 2) {
            this._msgNo = this.data.readInt16LE(0);
        }
        return this;
    }

    serialize() {
        const buffer = Buffer.alloc(this._header.length + 2);
        this._header._doSerialize().copy(buffer);
        this.data.copy(buffer, this._header._size);
        return buffer;
    }

    /**
     * @param {Buffer} buffer
     */
    setBuffer(buffer) {
        super.setBuffer(buffer);
        this._header.length = buffer.length + this._header._size - 2;
    }

    updateMsgNo() {
        this._msgNo = this.data.readInt16LE(0);
    }

    toString() {
        return `ServerMessage: ${JSON.stringify({
            header: this._header.toString(),
            data: this.data.toString("hex"),
        })}`;
    }
}
