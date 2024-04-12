import { SerializedBuffer } from "rusty-shared";

export class PlayerPhysicalMessage extends SerializedBuffer {
    _msgNo: number; // 2 bytes
    _playerId: number; // 4 bytes
    _bodytype: number; // 4 bytes
    _hairColor: number; // 4 bytes
    _skinColor: number; // 4 bytes
    _shirtColor: number; // 4 bytes
    _pantsColor: number; // 4 bytes
    constructor() {
        super();
        this._msgNo = 0; // 2 bytes
        this._playerId = 0; // 4 bytes
        this._bodytype = 0; // 4 bytes
        this._hairColor = 0; // 4 bytes
        this._skinColor = 0; // 4 bytes
        this._shirtColor = 0; // 4 bytes
        this._pantsColor = 0; // 4 bytes
        // total: 26 bytes
    }

    override size() {
        return 26;
    }

    override serialize() {
        const buffer = Buffer.alloc(this.size());
        let offset = 0;
        buffer.writeUInt16BE(this._msgNo, offset);
        offset += 2;
        buffer.writeUInt32BE(this._playerId, offset);
        offset += 4;
        buffer.writeUInt32BE(this._bodytype, offset);
        offset += 4;
        buffer.writeUInt32BE(this._hairColor, offset);
        offset += 4;
        buffer.writeUInt32BE(this._skinColor, offset);
        offset += 4;
        buffer.writeUInt32BE(this._shirtColor, offset);
        offset += 4;
        buffer.writeUInt32BE(this._pantsColor, offset);

        return buffer;
    }

    deserialize(buffer: Buffer) {
        let offset = 0;
        this._msgNo = buffer.readUInt16BE(offset);
        offset += 2;
        this._playerId = buffer.readUInt32BE(offset);
        offset += 4;
        this._bodytype = buffer.readUInt32BE(offset);
        offset += 4;
        this._hairColor = buffer.readUInt32BE(offset);
        offset += 4;
        this._skinColor = buffer.readUInt32BE(offset);
        offset += 4;
        this._shirtColor = buffer.readUInt32BE(offset);
        offset += 4;
        this._pantsColor = buffer.readUInt32BE(offset);
    }

    override toString() {
        return `PlayerPhysicalMessage: msgNo=${this._msgNo} playerId=${this._playerId} bodytype=${this._bodytype} hairColor=${this._hairColor} skinColor=${this._skinColor} shirtColor=${this._shirtColor} pantsColor=${this._pantsColor}`;
    }
}
