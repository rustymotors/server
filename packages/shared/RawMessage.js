// eslint-disable-next-line no-unused-vars
import { NPSMessage } from "./NPSMessage.js";
import { RawMessageHeader } from "./RawMessageHeader.js";

export class BaseMessage {
    constructor() {
        this._data = Buffer.alloc(0);
    }

    /**
     * @param {Buffer} buffer
     * @returns {BaseMessage}
     */
    _doDeserialize(buffer) {
        console.log(`BaseMessage _doDeserialize: ${buffer.toString("hex")}`);
        return this;
    }

    /**
     * @returns {Buffer}
     */
    _doSerialize() {
        console.log(`BaseMessage _doSerialize: ${this._data.toString("hex")}`);
        return this._data;
    }

    get data() {
        return this._data;
    }

    set data(value) {
        this._data = value;
    }
}

/**
 *
 * @mixin
 * @param {typeof BaseMessage} superclass
 * @return {typeof BaseMessage}
 */
const serializedMixin = (superclass) =>
    class extends superclass {
        /**
         * @param {Buffer} buffer
         * @returns {BaseMessage}
         */
        deserialize(buffer) {
            return super._doDeserialize(buffer);
        }

        /**
         * @returns {Buffer}
         * @throws {ServerError} Data is undefined
         */
        serialize() {
            return super._doSerialize();
        }
    };

export class RawMessage extends serializedMixin(BaseMessage) {
    constructor() {
        super();
        this._header = new RawMessageHeader();
        this.data = Buffer.alloc(0);
        this.raw = Buffer.alloc(0);
    }

    /**
     * @param {Buffer} buffer
     * @returns {RawMessage}
     */
    deserialize(buffer) {
        this._doDeserialize(buffer);
        this._header.deserialize(buffer);
        this.resizeBuffer(this._header.length);
        this.data = buffer.subarray(RawMessageHeader.size());
        this.raw = buffer;
        return this;
    }

    /**
     * @param {number} size
     */
    resizeBuffer(size) {
        if (this.data.length !== size) {
            this._header.length = size;
            this.data = Buffer.alloc(this._header.length);
        }
    }

    /**
     * @returns {Buffer}
     */
    serialize() {
        this._doSerialize();
        const buffer = Buffer.alloc(this._header.length);
        this._header.serialize().copy(buffer);
        this.data.copy(buffer, RawMessageHeader.size());
        return buffer;
    }

    get id() {
        return this._header.id;
    }

    set id(value) {
        this._header.id = value;
    }

    get length() {
        return this._header.length;
    }

    toString() {
        return `${this._header.toString()}, data: ${this.data.toString("hex")}`;
    }

    /**
     * @param {Buffer} buffer
     */
    static fromBuffer(buffer) {
        const message = new RawMessage();
        message.deserialize(buffer);
        return message;
    }

    /**
     * @param {NPSMessage} message
     */
    static fromNPSMessage(message) {
        const rawMessage = new RawMessage();
        rawMessage._header.id = message.msgNo;
        rawMessage._header.length = message.msgLength;
        rawMessage.data = message.data;
        return rawMessage;
    }
}
