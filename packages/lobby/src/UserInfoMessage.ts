import { ServerError } from "../../shared/errors/ServerError.js";
import {
    LegacyMessage,
    deserializeString,
    serializeString,
} from "../../shared/messageFactory.js";
// eslint-disable-next-line no-unused-vars
import { LoginInfoMessage } from "./LoginInfoMessage.js";

export class UserInfo {
    _userId: number;
    _userName: string;
    _userData: Buffer;
    constructor() {
        this._userId = 0; // 4 bytes
        this._userName = ""; // 4 bytes + string + 1 byte
        this._userData = Buffer.alloc(64); // 64 bytes
    }

    serialize() {
        const buffer = Buffer.alloc(this.size());
        let offset = 0;
        buffer.writeInt32BE(this._userId, offset);
        offset += 4;
        offset = serializeString(this._userName, buffer, offset);

        this._userData.copy(buffer, offset);
        offset += 64;
        return buffer;
    }

    size() {
        let size = 4; // userId
        size += 4 + this._userName.length + 1;
        size += this._userData.length;
        return size;
    }
}

export class UserInfoMessage extends LegacyMessage {
    _userId: number;
    _userName: string;
    _userData: Buffer;
    constructor() {
        super();
        this._userId = 0; // 4 bytes
        this._userName = ""; // 4 bytes + string + 1 byte
        this._userData = Buffer.alloc(64); // 64 bytes
    }

    /**
     * @param {Buffer} buffer
     * @returns {UserInfoMessage}
     */
    deserialize(buffer: Buffer): UserInfoMessage {
        try {
            this._header._doDeserialize(buffer);
            let offset = this._header._size;
            this._userId = buffer.readInt32BE(offset);
            offset += 4;
            this._userName = deserializeString(buffer.subarray(offset));
            offset += 4 + this._userName.length + 1;
            buffer.copy(this._userData, 0, offset, offset + 64);
            offset += 64;

            return this;
        } catch (error) {
            throw ServerError.fromUnknown(
                error,
                "Error deserializing LoginInfoMessage",
            );
        }
    }

    /**
     * @returns {Buffer}
     */
    override serialize(): Buffer {
        try {
            const buffer = Buffer.alloc(this._header.length);
            this._header._doSerialize().copy(buffer);
            let offset = this._header._size;
            buffer.writeInt32BE(this._userId, offset);
            offset += 4;
            offset = serializeString(this._userName, buffer, offset);

            this._userData.copy(buffer, offset);
            offset += 64;

            return buffer;
        } catch (error) {
            throw ServerError.fromUnknown(
                error,
                "Error serializing LoginInfoMessage",
            );
        }
    }

    /**
     * @param {LoginInfoMessage} loginInfoMessage
     */
    fromLoginInfoMessage(loginInfoMessage: LoginInfoMessage) {
        this._userId = loginInfoMessage._userId;
        this._userName = loginInfoMessage._userName;
        this._userData = loginInfoMessage._userData;
        this._header.length = this.calculateLength();
        return this;
    }

    calculateLength() {
        this._header._size = 4 + 4 + 64;
        this._header.length += 4 + this._userName.length + 1;
        this._header.length += this._userData.length;
        return this._header.length;
    }

    override toString() {
        return `UserInfoMessage: ${JSON.stringify({
            userId: this._userId,
            userName: this._userName,
            userData: this._userData.toString("hex"),
        })}`;
    }
}
