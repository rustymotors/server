import { SerializedBuffer } from "../../shared/messageFactory.js";

export class PartsAssemblyMessage extends SerializedBuffer {
    _msgNo: number;
    _ownerId: number;
    _numberOfParts: number;
    _partList: Part[];
    constructor(owerId: number) {
        super();
        this._msgNo = 0; // 2 bytes
        this._ownerId = owerId; // 4 bytes
        this._numberOfParts = 0; // 1 bytes
        /** @type {Part[]} */
        this._partList = []; // 8 bytes each
    }

    override size() {
        return 5 + this._partList.length * 8;
    }
}

export class Part extends SerializedBuffer {
    _partId: number; // 4 bytes
    _parentPartId: number; // 4 bytes
    _brandedPartId: number; // 4 bytes
    _repairPrice: number; // 4 bytes
    _junkPrice: number; // 4 bytes
    _wear: number; // 4 bytes
    _attachmentPoint: number; // 1 byte
    _damage: number; // 1 byte
    _retailPrice: number; // 4 bytes
    _maxWear: number; // 4 bytes

    constructor() {
        super();
        this._partId = 0; // 4 bytes
        this._parentPartId = 0; // 4 bytes
        this._brandedPartId = 0; // 4 bytes
        this._repairPrice = 0; // 4 bytes
        this._junkPrice = 0; // 4 bytes
        this._wear = 0; // 4 bytes
        this._attachmentPoint = 0; // 1 byte
        this._damage = 0; // 1 byte
        this._retailPrice = 0; // 4 bytes
        this._maxWear = 0; // 4 bytes
    }

    override size() {
        return 33;
    }

    override serialize() {
        const buffer = Buffer.alloc(this.size());
        let offset = 0;
        buffer.writeUInt32LE(this._partId, offset);
        offset += 4;
        buffer.writeUInt32LE(this._parentPartId, offset);
        offset += 4;
        buffer.writeUInt32LE(this._brandedPartId, offset);
        offset += 4;
        buffer.writeUInt32LE(this._repairPrice, offset);
        offset += 4;
        buffer.writeUInt32LE(this._junkPrice, offset);
        offset += 4;
        buffer.writeUInt32LE(this._wear, offset);
        offset += 4;
        buffer.writeUInt8(this._attachmentPoint, offset);
        offset += 1;
        buffer.writeUInt8(this._damage, offset);
        offset += 1;
        buffer.writeUInt32LE(this._retailPrice, offset);
        offset += 4;
        buffer.writeUInt32LE(this._maxWear, offset);

        return buffer;
    }

    override toString() {
        return `Part: partId=${this._partId} parentPartId=${this._parentPartId} brandedPartId=${this._brandedPartId} repairPrice=${this._repairPrice} junkPrice=${this._junkPrice} wear=${this._wear} attachmentPoint=${this._attachmentPoint} damage=${this._damage} retailPrice=${this._retailPrice} maxWear=${this._maxWear}`;    
    }
}
