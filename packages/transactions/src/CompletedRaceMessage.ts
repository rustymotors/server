import {
    checkMinLength,
    checkSize4,
    MessageNodeBody,
    sliceBuff,
} from "rusty-motors-shared";

/**
 * Inbound MC_RACE_RESULTS (msgNo 221 / 0xDD). Sent by the client when the
 * local racer crosses the finish line, reporting the result of the race.
 *
 * The original server (MCRaces.cpp:4913 `MCRaces_RacerCompletedRace`):
 *   - validates raceID and persona-in-race
 *   - rejects mismatched persona (anti-cheat: MC_POSSIBLE_CHEAT)
 *   - validates racing state == MCRaces_RACINGSTATE_RACING
 *   - persists the result to the race history database
 *   - awards cash, points, ranks, and part prizes
 *   - notifies other racers when all racers have reported
 *
 * Wire layout (variable, pack(1)):
 *   [0..1]    WORD             msgNo            (= 221)
 *   [2..3]    WORD             topSpeed         m/s, this race
 *   [4..7]    MCOTS_INTRAID    raceID           (DWORD)
 *   [8..11]   DWORD            id               persona id (or AI id)
 *   [12..15]  DWORD            completionTime   start..finish, in 64Hz ticks
 *   [16..19]  DWORD            bestLapTime      this race, 64Hz ticks
 *   [20..21]  WORD             avgSpeed         m/s, this race
 *   [22..25]  DWORD            securityFlags    client-detected cheats bitmask
 *   [26..29]  DWORD            travelMapLength  uncompressed length of travelMap
 *   [30..]    BYTE             travelMap[travelMapLength]
 *
 * Source struct: MCity/Server/MCDefs.h:1443 (CompletedRaceMsg).
 * Handler:        MCity/Server/MCRaces.cpp:4913 (MCRaces_RacerCompletedRace).
 */
export class CompletedRaceMessage extends MessageNodeBody {
    static readonly FIXED_PREFIX_SIZE = 30;

    private _msgNo: number;
    private _topSpeed: Buffer; // 2
    private _raceId: Buffer; // 4
    private _id: Buffer; // 4
    private _completionTime: Buffer; // 4
    private _bestLapTime: Buffer; // 4
    private _avgSpeed: Buffer; // 2
    private _securityFlags: Buffer; // 4
    private _travelMapLength: Buffer; // 4
    private _travelMap: Buffer; // variable

    constructor() {
        super();
        this._msgNo = 221; // MC_RACE_RESULTS
        this._topSpeed = Buffer.alloc(2);
        this._raceId = Buffer.alloc(4);
        this._id = Buffer.alloc(4);
        this._completionTime = Buffer.alloc(4);
        this._bestLapTime = Buffer.alloc(4);
        this._avgSpeed = Buffer.alloc(2);
        this._securityFlags = Buffer.alloc(4);
        this._travelMapLength = Buffer.alloc(4);
        this._travelMap = Buffer.alloc(0);
    }

    override get sizeOf() {
        return CompletedRaceMessage.FIXED_PREFIX_SIZE + this._travelMap.byteLength;
    }

    private _doSerialize(): Buffer<ArrayBufferLike> {
        const msgNo = Buffer.alloc(2);
        msgNo.writeInt16LE(this._msgNo);
        this.body_ = Buffer.concat([
            msgNo, // 0..2
            this._topSpeed, // 2..4
            this._raceId, // 4..8
            this._id, // 8..12
            this._completionTime, // 12..16
            this._bestLapTime, // 16..20
            this._avgSpeed, // 20..22
            this._securityFlags, // 22..26
            this._travelMapLength, // 26..30
            this._travelMap, // 30..end
        ]);
        return this.body_;
    }

    override serialize(): Buffer<ArrayBufferLike> {
        return this._doSerialize();
    }

    private _doDeSerialize(buf: Buffer) {
        checkMinLength(buf, CompletedRaceMessage.FIXED_PREFIX_SIZE);
        this.body_ = buf;
        this._msgNo = sliceBuff(buf, 0, 2).readInt16LE();
        this._topSpeed = sliceBuff(buf, 2, 2);
        this._raceId = sliceBuff(buf, 4, 4);
        this._id = sliceBuff(buf, 8, 4);
        this._completionTime = sliceBuff(buf, 12, 4);
        this._bestLapTime = sliceBuff(buf, 16, 4);
        this._avgSpeed = sliceBuff(buf, 20, 2);
        this._securityFlags = sliceBuff(buf, 22, 4);
        this._travelMapLength = sliceBuff(buf, 26, 4);
        const travelMapLen = this._travelMapLength.readUInt32LE();
        // Defensive: clamp to remaining bytes so a corrupt length field doesn't
        // throw on a slice past the end.
        const remaining = buf.byteLength - CompletedRaceMessage.FIXED_PREFIX_SIZE;
        const actualLen = Math.min(travelMapLen, Math.max(remaining, 0));
        this._travelMap = sliceBuff(
            buf,
            CompletedRaceMessage.FIXED_PREFIX_SIZE,
            actualLen,
        );
    }

    override deserialize(buf: Buffer): void {
        this._doDeSerialize(buf);
    }

    get raceId(): number {
        return this._raceId.readUInt32LE();
    }

    /** Persona id of the racer who finished. May be an AI id. */
    get id(): number {
        return this._id.readUInt32LE();
    }

    /** Top speed during the race, in m/s. */
    get topSpeed(): number {
        return this._topSpeed.readUInt16LE();
    }

    /** Average speed during the race, in m/s. */
    get avgSpeed(): number {
        return this._avgSpeed.readUInt16LE();
    }

    /** Total race time, start to finish, in 64Hz ticks. */
    get completionTime(): number {
        return this._completionTime.readUInt32LE();
    }

    /** Best single-lap time during the race, in 64Hz ticks. */
    get bestLapTime(): number {
        return this._bestLapTime.readUInt32LE();
    }

    /** Bitmask of client-detected cheat indicators. Non-zero deserves scrutiny. */
    get securityFlags(): number {
        return this._securityFlags.readUInt32LE();
    }

    /** Uncompressed length of the travelMap blob. */
    get travelMapLength(): number {
        return this._travelMapLength.readUInt32LE();
    }

    /** Compressed travel-map bytes (defensive copy). Length matches travelMapLength when uncorrupted. */
    get travelMap(): Buffer {
        return Buffer.from(this._travelMap);
    }

    set raceId(val: number) {
        checkSize4(val);
        this._raceId.writeUInt32LE(val);
    }

    set id(val: number) {
        checkSize4(val);
        this._id.writeUInt32LE(val);
    }

    set topSpeed(val: number) {
        if (val < 0 || val > 0xffff) {
            throw new RangeError(`topSpeed out of u16 range: ${val}`);
        }
        this._topSpeed.writeUInt16LE(val);
    }

    set avgSpeed(val: number) {
        if (val < 0 || val > 0xffff) {
            throw new RangeError(`avgSpeed out of u16 range: ${val}`);
        }
        this._avgSpeed.writeUInt16LE(val);
    }

    set completionTime(val: number) {
        checkSize4(val);
        this._completionTime.writeUInt32LE(val);
    }

    set bestLapTime(val: number) {
        checkSize4(val);
        this._bestLapTime.writeUInt32LE(val);
    }

    set securityFlags(val: number) {
        checkSize4(val);
        this._securityFlags.writeUInt32LE(val);
    }

    setTravelMap(bytes: Buffer): void {
        this._travelMap = Buffer.from(bytes);
        this._travelMapLength.writeUInt32LE(bytes.byteLength);
    }

    override toString() {
        return JSON.stringify({
            msgNo: this._msgNo,
            raceId: this.raceId,
            id: this.id,
            topSpeed: this.topSpeed,
            avgSpeed: this.avgSpeed,
            completionTime: this.completionTime,
            bestLapTime: this.bestLapTime,
            securityFlags: this.securityFlags,
            travelMapLength: this.travelMapLength,
            travelMapBytes: this._travelMap.byteLength,
        });
    }
}
