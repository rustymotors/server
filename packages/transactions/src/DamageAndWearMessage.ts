import {
    checkMinLength,
    checkSize4,
    MessageNodeBody,
    sliceBuff,
} from "rusty-motors-shared";

/**
 * Inbound MC_REPORT_POST_RACE_DAMAGE (msgNo 241 / 0x00F1).
 *
 * Sent at end of race to commit the final per-part damage *and* wear values
 * to the database. The wear and damagePercent are packed into a single
 * DWORD per part (top byte = damage%, low 24 bits = wear).
 *
 * Wire layout (pack(1), variable: 8-byte header + 8 * noParts):
 *   [0..1]    WORD   msgNo            (= 241)
 *   [2..5]    DWORD  raceID
 *   [6..7]    WORD   noParts
 *   [8..]     PackedDamageAndWear damageWearList[noParts]
 *
 * Each PackedDamageAndWear (8 bytes, pack(1)):
 *   [+0..3]   DWORD partID
 *   [+4..7]   DWORD packedDamWear
 *               // (damagePercent & 0xFF) << 24 | (wear & 0xFFFFFF)
 *
 * Source struct: MCity/Server/MCDefs.h:1577 (DamageAndWearMsg) +
 *                MCDefs.h:1571 (PackedDamageAndWear).
 * Handler:       MCity/Server/MCParts.cpp:613 (ReportPostRaceDamage).
 */
export class DamageAndWearMessage extends MessageNodeBody {
    static readonly HEADER_SIZE = 8;
    static readonly RECORD_SIZE = 8;

    private _msgNo: number;
    private _raceId: Buffer; // 4
    private _noParts: number;
    private _records: { partId: number; packedDamWear: number }[];

    constructor() {
        super();
        this._msgNo = 241;
        this._raceId = Buffer.alloc(4);
        this._noParts = 0;
        this._records = [];
    }

    override get sizeOf(): number {
        return (
            DamageAndWearMessage.HEADER_SIZE +
            this._records.length * DamageAndWearMessage.RECORD_SIZE
        );
    }

    override serialize(): Buffer<ArrayBufferLike> {
        const buf = Buffer.alloc(this.sizeOf);
        buf.writeUInt16LE(this._msgNo, 0);
        this._raceId.copy(buf, 2);
        buf.writeUInt16LE(this._noParts, 6);
        for (let i = 0; i < this._records.length; i++) {
            const r = this._records[i]!;
            const off =
                DamageAndWearMessage.HEADER_SIZE +
                i * DamageAndWearMessage.RECORD_SIZE;
            buf.writeUInt32LE(r.partId >>> 0, off);
            buf.writeUInt32LE(r.packedDamWear >>> 0, off + 4);
        }
        this.body_ = buf;
        return buf;
    }

    override deserialize(buf: Buffer): void {
        checkMinLength(buf, DamageAndWearMessage.HEADER_SIZE);
        this.body_ = buf;
        this._msgNo = buf.readUInt16LE(0);
        this._raceId = sliceBuff(buf, 2, 4);
        this._noParts = buf.readUInt16LE(6);

        const remainingBytes =
            buf.byteLength - DamageAndWearMessage.HEADER_SIZE;
        const maxRecordsFromBuffer = Math.floor(
            remainingBytes / DamageAndWearMessage.RECORD_SIZE,
        );
        // Defensive: parse only as many records as actually fit, even if
        // noParts overstates the truth.
        const recordsToRead = Math.min(this._noParts, maxRecordsFromBuffer);

        const records: { partId: number; packedDamWear: number }[] = new Array(
            recordsToRead,
        );
        for (let i = 0; i < recordsToRead; i++) {
            const off =
                DamageAndWearMessage.HEADER_SIZE +
                i * DamageAndWearMessage.RECORD_SIZE;
            records[i] = {
                partId: buf.readUInt32LE(off),
                packedDamWear: buf.readUInt32LE(off + 4),
            };
        }
        this._records = records;
    }

    get raceId(): number {
        return this._raceId.readUInt32LE();
    }

    set raceId(val: number) {
        checkSize4(val);
        this._raceId.writeUInt32LE(val);
    }

    /** Declared number of records in the message. */
    get noParts(): number {
        return this._noParts;
    }

    /** Returns each (partId, damagePercent, wear) entry, unpacking packedDamWear. */
    getEntries(): { partId: number; damagePercent: number; wear: number }[] {
        return this._records.map((r) => ({
            partId: r.partId,
            damagePercent: (r.packedDamWear >>> 24) & 0xff,
            wear: r.packedDamWear & 0xffffff,
        }));
    }

    setEntries(
        entries: ReadonlyArray<{
            partId: number;
            damagePercent: number;
            wear: number;
        }>,
    ): void {
        if (entries.length > 0xffff) {
            throw new RangeError(
                `noParts ${entries.length} exceeds u16 max 65535`,
            );
        }
        const records: { partId: number; packedDamWear: number }[] = [];
        for (let i = 0; i < entries.length; i++) {
            const e = entries[i]!;
            checkSize4(e.partId);
            if (e.damagePercent < 0 || e.damagePercent > 0xff) {
                throw new RangeError(
                    `damagePercent[${i}] out of u8: ${e.damagePercent}`,
                );
            }
            if (e.wear < 0 || e.wear > 0xffffff) {
                throw new RangeError(`wear[${i}] out of u24: ${e.wear}`);
            }
            const packed =
                ((e.damagePercent & 0xff) << 24) | (e.wear & 0xffffff);
            records.push({ partId: e.partId, packedDamWear: packed >>> 0 });
        }
        this._records = records;
        this._noParts = entries.length;
    }

    override toString(): string {
        return JSON.stringify({
            msgNo: this._msgNo,
            raceId: this.raceId,
            noParts: this._noParts,
            recordCount: this._records.length,
        });
    }
}
