import {
    checkMinLength,
    checkSize4,
    MessageNodeBody,
    sliceBuff,
} from "rusty-motors-shared";

/**
 * Inbound MC_UPDATE_BODY_DAMAGE (msgNo 202 / 0x00CA).
 *
 * Reports the visual body-damage blob for a vehicle. raceID may be 0 (out of
 * race / arcade) or a valid raceID (end-of-race damage commit). The legacy
 * server upserts the blob into the vehicle row via stored procedure.
 *
 * Wire layout (pack(1), variable size, 12-byte header + damage[damageLength]):
 *   [0..1]    WORD   msgNo            (= 202)
 *   [2..5]    DWORD  vehicleID
 *   [6..9]    DWORD  raceID           (0 if out of race)
 *   [10..11]  WORD   damageLength
 *   [12..]    BYTE   damage[damageLength]
 *
 * Source struct: MCity/Server/MCDefs.h:1562 (BodyDamage).
 * Handler:       MCity/Server/MCCar.cpp:999 (UpdateBodyDamage).
 */
export class BodyDamageMessage extends MessageNodeBody {
    static readonly HEADER_SIZE = 12;

    private _msgNo: number;
    private _vehicleId: Buffer; // 4
    private _raceId: Buffer; // 4
    private _damageLength: Buffer; // 2
    private _damage: Buffer; // variable

    constructor() {
        super();
        this._msgNo = 202;
        this._vehicleId = Buffer.alloc(4);
        this._raceId = Buffer.alloc(4);
        this._damageLength = Buffer.alloc(2);
        this._damage = Buffer.alloc(0);
    }

    override get sizeOf(): number {
        return BodyDamageMessage.HEADER_SIZE + this._damage.byteLength;
    }

    override serialize(): Buffer<ArrayBufferLike> {
        const buf = Buffer.alloc(this.sizeOf);
        buf.writeUInt16LE(this._msgNo, 0);
        this._vehicleId.copy(buf, 2);
        this._raceId.copy(buf, 6);
        this._damageLength.copy(buf, 10);
        this._damage.copy(buf, 12);
        this.body_ = buf;
        return buf;
    }

    override deserialize(buf: Buffer): void {
        checkMinLength(buf, BodyDamageMessage.HEADER_SIZE);
        this.body_ = buf;
        this._msgNo = buf.readUInt16LE(0);
        this._vehicleId = sliceBuff(buf, 2, 4);
        this._raceId = sliceBuff(buf, 6, 4);
        this._damageLength = sliceBuff(buf, 10, 2);

        const declared = this._damageLength.readUInt16LE();
        const remaining = buf.byteLength - BodyDamageMessage.HEADER_SIZE;
        // Defensive: clamp to remaining bytes so a corrupt length field
        // doesn't throw on slice past end.
        const actualLen = Math.min(declared, Math.max(remaining, 0));
        this._damage = sliceBuff(buf, BodyDamageMessage.HEADER_SIZE, actualLen);
    }

    get vehicleId(): number {
        return this._vehicleId.readUInt32LE();
    }

    set vehicleId(val: number) {
        checkSize4(val);
        this._vehicleId.writeUInt32LE(val);
    }

    get raceId(): number {
        return this._raceId.readUInt32LE();
    }

    set raceId(val: number) {
        checkSize4(val);
        this._raceId.writeUInt32LE(val);
    }

    /** Declared length of the damage blob in bytes. */
    get damageLength(): number {
        return this._damageLength.readUInt16LE();
    }

    /** Damage blob bytes (defensive copy). Length matches damageLength when uncorrupted. */
    get damage(): Buffer {
        return Buffer.from(this._damage);
    }

    setDamage(bytes: Buffer): void {
        if (bytes.byteLength > 0xffff) {
            throw new RangeError(
                `damage blob length ${bytes.byteLength} exceeds u16 max 65535`,
            );
        }
        this._damage = Buffer.from(bytes);
        this._damageLength.writeUInt16LE(bytes.byteLength);
    }

    override toString(): string {
        return JSON.stringify({
            msgNo: this._msgNo,
            vehicleId: this.vehicleId,
            raceId: this.raceId,
            damageLength: this.damageLength,
            damageBytes: this._damage.byteLength,
        });
    }
}
