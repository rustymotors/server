import {
    checkMinLength,
    checkSize4,
    MessageNodeBody,
    sliceBuff,
} from "rusty-motors-shared";

/**
 * Inbound MC_IN_RACE_DAMAGE_UPDATE (msgNo 240 / 0x00F0).
 *
 * Periodic in-race telemetry: the client reports current damage levels for
 * up to 47 parts on the local racer's car. Server-side, the original handler
 * upserts damage on each part and invalidates the affected vehicle's car-info
 * cache.
 *
 * Wire layout (pack(1), fixed 243 bytes):
 *   [0..1]      WORD   msgNo                  (= 240)
 *   [2..5]      DWORD  raceID
 *   [6..7]      WORD   noParts                (<= 47, MC_PART_DAMAGE_SET_LENGTH)
 *   [8..195]    DWORD  partID[47]             (only first noParts entries are valid)
 *   [196..242]  BYTE   damagePercent[47]      (only first noParts entries are valid)
 *
 * Source struct: MCity/Server/MCDefs.h:1545 (DamagedPartsMsg).
 * Handler:       MCity/Server/MCParts.cpp:545 (InRaceDamageUpdate).
 */
export class DamagedPartsMessage extends MessageNodeBody {
    static readonly MAX_PARTS = 47;
    static readonly PART_IDS_OFFSET = 8;
    static readonly DAMAGE_PERCENTS_OFFSET = 196;
    static readonly FIXED_SIZE = 243;

    private _msgNo: number;
    private _raceId: Buffer;
    private _noParts: number;
    private _partIds: Uint32Array;
    private _damagePercents: Uint8Array;

    constructor() {
        super();
        this._msgNo = 240;
        this._raceId = Buffer.alloc(4);
        this._noParts = 0;
        this._partIds = new Uint32Array(DamagedPartsMessage.MAX_PARTS);
        this._damagePercents = new Uint8Array(DamagedPartsMessage.MAX_PARTS);
    }

    override get sizeOf(): number {
        return DamagedPartsMessage.FIXED_SIZE;
    }

    override serialize(): Buffer<ArrayBufferLike> {
        const buf = Buffer.alloc(DamagedPartsMessage.FIXED_SIZE);
        buf.writeUInt16LE(this._msgNo, 0);
        this._raceId.copy(buf, 2);
        buf.writeUInt16LE(this._noParts, 6);
        for (let i = 0; i < DamagedPartsMessage.MAX_PARTS; i++) {
            buf.writeUInt32LE(
                this._partIds[i]! >>> 0,
                DamagedPartsMessage.PART_IDS_OFFSET + i * 4,
            );
            buf.writeUInt8(
                this._damagePercents[i]! & 0xff,
                DamagedPartsMessage.DAMAGE_PERCENTS_OFFSET + i,
            );
        }
        this.body_ = buf;
        return buf;
    }

    override deserialize(buf: Buffer): void {
        checkMinLength(buf, DamagedPartsMessage.FIXED_SIZE);
        this.body_ = buf;
        this._msgNo = buf.readUInt16LE(0);
        this._raceId = sliceBuff(buf, 2, 4);
        this._noParts = buf.readUInt16LE(6);
        for (let i = 0; i < DamagedPartsMessage.MAX_PARTS; i++) {
            this._partIds[i] = buf.readUInt32LE(
                DamagedPartsMessage.PART_IDS_OFFSET + i * 4,
            );
            this._damagePercents[i] = buf.readUInt8(
                DamagedPartsMessage.DAMAGE_PERCENTS_OFFSET + i,
            );
        }
    }

    get raceId(): number {
        return this._raceId.readUInt32LE();
    }

    set raceId(val: number) {
        checkSize4(val);
        this._raceId.writeUInt32LE(val);
    }

    /** Number of valid entries in partIds/damagePercents. <= MAX_PARTS. */
    get noParts(): number {
        return this._noParts;
    }

    /** Returns the first `noParts` (partId, damagePercent) entries. */
    getValidParts(): { partId: number; damagePercent: number }[] {
        const n = Math.min(this._noParts, DamagedPartsMessage.MAX_PARTS);
        const out: { partId: number; damagePercent: number }[] = new Array(n);
        for (let i = 0; i < n; i++) {
            out[i] = {
                partId: this._partIds[i]!,
                damagePercent: this._damagePercents[i]!,
            };
        }
        return out;
    }

    setParts(
        entries: ReadonlyArray<{ partId: number; damagePercent: number }>,
    ): void {
        if (entries.length > DamagedPartsMessage.MAX_PARTS) {
            throw new RangeError(
                `noParts ${entries.length} exceeds MAX_PARTS ${DamagedPartsMessage.MAX_PARTS}`,
            );
        }
        this._partIds = new Uint32Array(DamagedPartsMessage.MAX_PARTS);
        this._damagePercents = new Uint8Array(DamagedPartsMessage.MAX_PARTS);
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i]!;
            checkSize4(entry.partId);
            if (entry.damagePercent < 0 || entry.damagePercent > 0xff) {
                throw new RangeError(
                    `damagePercent[${i}] out of u8 range: ${entry.damagePercent}`,
                );
            }
            this._partIds[i] = entry.partId;
            this._damagePercents[i] = entry.damagePercent;
        }
        this._noParts = entries.length;
    }

    override toString(): string {
        return JSON.stringify({
            msgNo: this._msgNo,
            raceId: this.raceId,
            noParts: this._noParts,
        });
    }
}
