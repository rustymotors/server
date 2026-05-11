import {
    BytableBuffer,
    BytableDword,
    BytableWord,
    BytableByte,
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

function byteField(name: string, value: number): BytableByte {
    const field = new BytableByte();
    field.setName(name);
    field.setValue(value);
    return field;
}

// Matches C++ struct Part (MCDefs.h:1038) — 26 bytes on the wire.
// retailPrice and maxItemWear are MCOTS-only aliases; they are not sent to the client.
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
        return serializeFields([
            dwordLE("partId", this._partId),
            dwordLE("parentPartId", this._parentPartId),
            dwordLE("brandedPartId", this._brandedPartId),
            dwordLE("repairPrice", this._repairPrice),
            dwordLE("junkPrice", this._junkPrice),
            dwordLE("wear", this._wear),
            byteField("attachmentPoint", this._attachmentPoint),
            byteField("damage", this._damage),
        ]);
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
