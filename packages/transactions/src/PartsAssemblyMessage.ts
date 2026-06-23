import {
    BytableBuffer,
    BytableDword,
    BytableWord,
    serialize as serializeFields,
} from "@rustymotors/binary";

function dwordLE(name: string, value: number): BytableDword {
    const field = new BytableDword();
    field.setName(name);
    const buf = Buffer.alloc(4);
    buf.writeUInt32LE(value, 0);
    field.setValue(buf);
    return field;
}

function wordLE(name: string, value: number): BytableWord {
    const field = new BytableWord();
    field.setName(name);
    const buf = Buffer.alloc(2);
    buf.writeUInt16LE(value, 0);
    field.deserialize(buf);
    return field;
}

// Matches C++ struct Part — 26 bytes on the wire.
// 6×DWORD (24 bytes) + 2×BYTE (2 bytes) = 26 bytes. No padding sent.
export class Part extends BytableBuffer {
    _partId = 0;        // DWORD
    _parentPartId = 0;  // DWORD
    _brandedPartId = 0; // DWORD
    _repairPrice = 0;   // DWORD
    _junkPrice = 0;     // DWORD
    _wear = 0;          // DWORD
    _attachmentPoint = 0; // BYTE
    _damage = 0;          // BYTE

    override get serializeSize() {
        return 26;
    }

    override serialize() {
        const buf = Buffer.alloc(26);
        buf.writeUInt32LE(this._partId, 0);
        buf.writeUInt32LE(this._parentPartId, 4);
        buf.writeUInt32LE(this._brandedPartId, 8);
        buf.writeUInt32LE(this._repairPrice, 12);
        buf.writeUInt32LE(this._junkPrice, 16);
        buf.writeUInt32LE(this._wear, 20);
        buf.writeUInt8(this._attachmentPoint, 24);
        buf.writeUInt8(this._damage, 25);
        return buf;
    }

    override toString() {
        return `Part: partId=${this._partId} parentPartId=${this._parentPartId} brandedPartId=${this._brandedPartId} repairPrice=${this._repairPrice} junkPrice=${this._junkPrice} wear=${this._wear} attachmentPoint=${this._attachmentPoint} damage=${this._damage}`;
    }
}

// Matches C++ struct PartAssemblyMsg (MCDefs.h:1196).
// Header: WORD msgNo + DWORD ownerID + WORD noParts = 8 bytes.
// Followed by noParts * 26-byte Part records.
export class PartsAssemblyMessage extends BytableBuffer {
    _msgNo = 0;
    _ownerId: number;
    _numberOfParts = 0;
    _partList: Part[] = [];

    constructor(ownerId: number) {
        super();
        this._ownerId = ownerId;
    }

    override get serializeSize() {
        return 8 + this._partList.length * 26;
    }

    override serialize() {
        const header = serializeFields([
            wordLE("msgNo", this._msgNo),
            dwordLE("ownerId", this._ownerId),
            wordLE("numberOfParts", this._numberOfParts),
        ]);
        const parts = Buffer.concat(this._partList.map((p) => p.serialize()));
        return Buffer.concat([header, parts]);
    }
}
