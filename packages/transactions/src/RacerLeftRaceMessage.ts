import {
    checkMinLength,
    checkSize4,
    MessageNodeBody,
    sliceBuff,
} from "rusty-motors-shared";

/**
 * Inbound MC_RACER_LEFT_RACE (msgNo 235 / 0x00EB).
 *
 * Sent when the player quits the race (e.g. selects "Replay" / aborts before
 * crossing the finish line). The legacy server uses the GenericRequest shape
 * for this message — `data` carries the raceID, `data2` is unused for this
 * opcode.
 *
 * Wire layout (pack(1), fixed 10 bytes — GenericRequest):
 *   [0..1]   WORD   msgNo            (= 235)
 *   [2..5]   int32  data             raceID
 *   [6..9]   int32  data2            unused for this opcode
 *
 * Source struct: MCity/Server/MCDefs.h:632 (GenericRequest).
 * Handler:       MCity/Server/MCRaces.cpp:5236 (MCRaces_RacerLeftRace).
 */
export class RacerLeftRaceMessage extends MessageNodeBody {
    static readonly FIXED_SIZE = 10;

    private _msgNo: number;
    private _raceId: Buffer; // 4
    private _data2: Buffer; // 4 (preserved for round-trips even though unused)

    constructor() {
        super();
        this._msgNo = 235;
        this._raceId = Buffer.alloc(4);
        this._data2 = Buffer.alloc(4);
    }

    override get sizeOf(): number {
        return RacerLeftRaceMessage.FIXED_SIZE;
    }

    override serialize(): Buffer<ArrayBufferLike> {
        const buf = Buffer.alloc(RacerLeftRaceMessage.FIXED_SIZE);
        buf.writeUInt16LE(this._msgNo, 0);
        this._raceId.copy(buf, 2);
        this._data2.copy(buf, 6);
        this.body_ = buf;
        return buf;
    }

    override deserialize(buf: Buffer): void {
        checkMinLength(buf, RacerLeftRaceMessage.FIXED_SIZE);
        this.body_ = buf;
        this._msgNo = buf.readUInt16LE(0);
        this._raceId = sliceBuff(buf, 2, 4);
        this._data2 = sliceBuff(buf, 6, 4);
    }

    get raceId(): number {
        return this._raceId.readInt32LE();
    }

    set raceId(val: number) {
        checkSize4(val);
        this._raceId.writeInt32LE(val);
    }

    /** Second GenericRequest field, unused for MC_RACER_LEFT_RACE. */
    get data2(): number {
        return this._data2.readInt32LE();
    }

    override toString(): string {
        return JSON.stringify({
            msgNo: this._msgNo,
            raceId: this.raceId,
            data2: this.data2,
        });
    }
}
