import { ServerError } from "../../shared/errors/ServerError.js";
import {
    LegacyMessage,
    serializeString,
    SerializedBuffer,
} from "../../shared/messageFactory.js";

export class MiniRiffMessage extends LegacyMessage {
    constructor() {
        super();
        /** @type {MiniRiffInfo[]} */
        this._riffList = [];
    }

    size() {
        let size = 4;
        for (const riff of this._riffList) {
            size += riff.size();
        }
        return size;
    }

    /** @param {MiniRiffInfo} riff */
    addRiff(riff) {
        this._riffList.push(riff);
    }

    /**
     * @returns {Buffer}
     */
    serialize() {
        try {
            const neededSize = this.size();
            this._header.length = neededSize + 4;
            const buffer = Buffer.alloc(this._header.length);
            this._header._doSerialize().copy(buffer);
            let offset = this._header._size; // offset is 4
            buffer.writeUInt16BE(this._riffList.length, offset);
            offset += 4;
            for (const riff of this._riffList) {
                riff.serialize().copy(buffer, offset);
                offset += riff.size();
            }

            return buffer;
        } catch (error) {
            throw ServerError.fromUnknown(
                error,
                "Error serializing MiniRiffMessage",
            );
        }
    }

    toString() {
        return `MiniRiffMessage: ${this._riffList.length} riff(s)`;
    }
}

export class MiniRiffInfo extends SerializedBuffer {
    constructor() {
        super();
        this._riffName = ""; // max 32 bytes
        this._riffId = 0; // 4 bytes
        this._riffPopulation = 0; // 2 bytes
    }

    size() {
        return 4 + (4 + this._riffName.length + 1) + 4 + 2;
    }

    /**
     * @returns {Buffer}
     */
    serialize() {
        try {
            const buffer = Buffer.alloc(this.size());
            let offset = 0;
            if (this._riffName.length > 32) {
                throw new Error("Riff name is too long");
            }
            offset = serializeString(this._riffName, buffer, offset);

            buffer.writeUInt32BE(this._riffId, offset);
            offset += 4;
            buffer.writeUInt16BE(this._riffPopulation, offset);

            return buffer;
        } catch (error) {
            throw ServerError.fromUnknown(
                error,
                "Error serializing LoginInfoMessage",
            );
        }
    }

    toString() {
        return `MiniRiffInfo: ${this._riffName} (${this._riffId}) - ${this._riffPopulation}`;
    }
}
