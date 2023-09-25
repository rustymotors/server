import {
    LegacyMessage,
    deserializeString,
    serializeString,
} from "../../shared/messageFactory.js";

export class LoginInfoMessage extends LegacyMessage {
    constructor() {
        super();
        this._userId = 0;
        this._userName = "";
        this._userData = Buffer.alloc(64);
        this._customerId = 0;
        this._flags = 0;
        this._dllVersion = "";
        this._hostname = "";
        this._idAddress = "";
        this._hashKey = Buffer.alloc(16);
    }

    /**
     * @param {Buffer} buffer
     * @returns {LoginInfoMessage}
     */
    deserialize(buffer) {
        this._header._doDeserialize(buffer);
        let offset = this._header._size;
        this._userId = buffer.readInt32BE(offset);
        offset += 4;
        this._userName = deserializeString(buffer.subarray(offset));
        offset += 4 + this._userName.length + 1;
        buffer.copy(this._userData, 0, offset, offset + 64);
        offset += 64;
        this._customerId = buffer.readInt32BE(offset);
        offset += 4;
        this._flags = buffer.readInt32BE(offset);
        offset += 4;
        this._dllVersion = deserializeString(buffer.subarray(offset));
        offset += 4 + this._dllVersion.length + 1;
        this._hostname = deserializeString(buffer.subarray(offset));
        offset += 4 + this._hostname.length + 1;
        this._idAddress = deserializeString(buffer.subarray(offset));
        offset += 4 + this._idAddress.length + 1;
        buffer.copy(this._hashKey, 0, offset, offset + 16);
        offset += 16;
    }

    /**
     * @returns {Buffer}
     */
    serialize() {
        const buffer = Buffer.alloc(this._header.length);
        this._header._doSerialize().copy(buffer);
        let offset = this._header._size;
        buffer.writeInt32BE(this._userId, offset);
        offset += 4;
        serializeString(this._userName).copy(buffer, offset);
        offset += 4 + this._userName.length + 1;
        this._userData.copy(buffer, offset);
        offset += 64;
        buffer.writeInt32BE(this._customerId, offset);
        offset += 4;
        buffer.writeInt32BE(this._flags, offset);
        offset += 4;
        serializeString(this._dllVersion).copy(buffer, offset);
        offset += 4 + this._dllVersion.length + 1;
        serializeString(this._hostname).copy(buffer, offset);
        offset += 4 + this._hostname.length + 1;
        serializeString(this._idAddress).copy(buffer, offset);
        offset += 4 + this._idAddress.length + 1;
        this._hashKey.copy(buffer, offset);
        offset += 16;
        return buffer;
    }

    asJson() {
        return JSON.stringify({
            userId: this._userId,
            userName: this._userName,
            userData: this._userData.toString("hex"),
            customerId: this._customerId,
            flags: this._flags,
            dllVersion: this._dllVersion,
            hostname: this._hostname,
            idAddress: this._idAddress,
            hashKey: this._hashKey.toString("hex"),
        });
    }
}
