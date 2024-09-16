import { ServerError } from "./ServerError.js";
import { legacyHeader } from "./legacyHeader.js";

/**
 * A game message header is a 8 byte header with the following fields:
 * - 2 bytes - id
 * - 2 bytes - length
 * - 2 bytes - gameMessageId
 * - 2 bytes - gameMessageLength
 */

export class GameMessageHeader extends legacyHeader {
    _gameMessageId: number; // 2 bytes
    _gameMessageLength: number; // 2 bytes

    constructor(gameMessageId: number) {
        super();
        this._size = 8;
        this.id = 0x1101; // 2 bytes
        this._gameMessageId = gameMessageId; // 2 bytes
        this._gameMessageLength = 0; // 2 bytes
    }

    size() {
        return 8;
    }

    deserialize(buffer: Buffer) {
        if (buffer.length < 8) {
            throw new ServerError(
                `Buffer length ${buffer.length} is too short to deserialize`,
            );
        }

        try {
            this.id = buffer.readInt16BE(0);
            this.length = buffer.readInt16BE(2);
            this._gameMessageId = buffer.readInt16BE(4);
            this._gameMessageLength = buffer.readInt16BE(6);
        } catch (error) {
            throw new ServerError(
                `Error deserializing buffer: ${String(error)}`,
            );
        }
        return this;
    }

    serialize() {
        const buffer = Buffer.alloc(8);
        buffer.writeInt16BE(this.id, 0);
        buffer.writeInt16BE(this.length, 2);
        buffer.writeInt16BE(this._gameMessageId, 4);
        buffer.writeInt16BE(this._gameMessageLength, 6);
        return buffer;
    }
}
