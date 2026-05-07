import {
    checkMinLength,
    checkSize4,
    MessageNodeBody,
    sliceBuff,
    type Serializable,
} from "rusty-motors-shared";

/**
 * Fixed-size racer entry in the inbound MC_RACE_START packet.
 *
 * Wire layout (9 bytes, pack(1) — confirmed by capture):
 *   DWORD id;          // 4
 *   DWORD vehicleID;   // 4
 *   BYTE  isHuman;     // 1
 */
export class StartingRacers implements Serializable {
    private _id; // 4
    private _vehicleId; // 4
    private _isHuman; // 1

    constructor() {
        this._id = Buffer.alloc(4);
        this._vehicleId = Buffer.alloc(4);
        this._isHuman = Buffer.alloc(1);
    }

    get sizeOf() {
        return 9;
    }

    serialize() {
        return Buffer.concat([this._id, this._vehicleId, this._isHuman]);
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        this._id = sliceBuff(buf, 0, 4);
        this._vehicleId = sliceBuff(buf, 4, 4);
        this._isHuman = sliceBuff(buf, 8, 1);
    }

    get id(): number {
        return this._id.readUInt32LE();
    }

    get vehicleId(): number {
        return this._vehicleId.readUInt32LE();
    }

    get isHuman(): boolean {
        return this._isHuman.readUInt8() !== 0;
    }

    set id(val: number) {
        checkSize4(val);
        this._id.writeUInt32LE(val);
    }

    set vehicleId(val: number) {
        checkSize4(val);
        this._vehicleId.writeUInt32LE(val);
    }

    set isHuman(val: boolean) {
        this._isHuman.writeUInt8(val ? 1 : 0);
    }
}

/**
 * Fixed-size racer entry in the outbound MC_RACE_STARTED reply.
 *
 * Wire layout (5 bytes, pack(1)):
 *   DWORD id;         // 4
 *   BYTE  isntValid;  // 1
 */
export class StartingRacersResult implements Serializable {
    private _id; // 4
    private _isntValid; // 1

    constructor() {
        this._id = Buffer.alloc(4);
        this._isntValid = Buffer.alloc(1);
    }

    get sizeOf() {
        return 5;
    }

    serialize() {
        return Buffer.concat([this._id, this._isntValid]);
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        this._id = sliceBuff(buf, 0, 4);
        this._isntValid = sliceBuff(buf, 4, 1);
    }

    get id(): number {
        return this._id.readUInt32LE();
    }

    get isntValid(): boolean {
        return this._isntValid.readUInt8() !== 0;
    }

    set id(val: number) {
        checkSize4(val);
        this._id.writeUInt32LE(val);
    }

    set isntValid(val: boolean) {
        this._isntValid.writeUInt8(val ? 1 : 0);
    }
}

/**
 * Inbound MC_RACE_START (msgNo 232 / 0xE8). Sent by the host client when it
 * wants to begin the race that was previously created and joined.
 *
 * Wire layout (70 bytes, pack(1) — confirmed by capture):
 *   WORD            msgNo;             // offset 0, size 2
 *   MCOTS_INTRAID   raceID;            // offset 2, size 4 (DWORD)
 *   StartingRacers  racers[6];         // offset 6, size 54 (6 * 9)
 *   BYTE            multiRoundLimit;   // offset 60
 *   BYTE            numLaps;           // offset 61
 *   DWORD           lobbyFlags;        // offset 62, size 4
 *   WORD            dialinTicks[2];    // offset 66, size 4
 *
 * Source struct: MCity/Server/MCDefs.h:1414 (StartRaceMsg).
 * Handler:        MCity/Server/MCRaces.cpp:2880 (MCRaces_StartRace).
 */
export class StartRaceMessage extends MessageNodeBody {
    private _msgNo;
    private _raceId; // 4
    private _racers: StartingRacers[]; // 6 * 9
    private _multiRoundLimit; // 1
    private _numLaps; // 1
    private _lobbyFlags; // 4
    private _dialinTicks; // 4 (two WORDs)

    constructor() {
        super();
        this._msgNo = 232; // MC_RACE_START
        this._raceId = Buffer.alloc(4);
        this._racers = Array.from({ length: 6 }, () => new StartingRacers());
        this._multiRoundLimit = Buffer.alloc(1);
        this._numLaps = Buffer.alloc(1);
        this._lobbyFlags = Buffer.alloc(4);
        this._dialinTicks = Buffer.alloc(4);
    }

    override get sizeOf() {
        return 70;
    }

    private _doSerialize(): Buffer<ArrayBufferLike> {
        const msgNo = Buffer.alloc(2);
        msgNo.writeInt16LE(this._msgNo);
        const racersBuf = Buffer.concat(
            this._racers.map((r) => r.serialize()),
        );
        this.body_ = Buffer.concat([
            msgNo, // 0..2
            this._raceId, // 2..6
            racersBuf, // 6..60
            this._multiRoundLimit, // 60
            this._numLaps, // 61
            this._lobbyFlags, // 62..66
            this._dialinTicks, // 66..70
        ]);
        return this.body_;
    }

    override serialize(): Buffer<ArrayBufferLike> {
        return this._doSerialize();
    }

    private _doDeSerialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        this.body_ = buf;
        this._msgNo = sliceBuff(buf, 0, 2).readInt16LE();
        this._raceId = sliceBuff(buf, 2, 4);
        let offset = 6;
        for (let i = 0; i < 6; i++) {
            this._racers[i]!.deserialize(sliceBuff(buf, offset, 9));
            offset += 9;
        }
        this._multiRoundLimit = sliceBuff(buf, offset, 1);
        offset += 1;
        this._numLaps = sliceBuff(buf, offset, 1);
        offset += 1;
        this._lobbyFlags = sliceBuff(buf, offset, 4);
        offset += 4;
        this._dialinTicks = sliceBuff(buf, offset, 4);
    }

    override deserialize(buf: Buffer): void {
        this._doDeSerialize(buf);
    }

    get raceId(): number {
        return this._raceId.readUInt32LE();
    }

    get racers(): readonly StartingRacers[] {
        return this._racers;
    }

    get multiRoundLimit(): number {
        return this._multiRoundLimit.readUInt8();
    }

    get numLaps(): number {
        return this._numLaps.readUInt8();
    }

    get lobbyFlags(): number {
        return this._lobbyFlags.readUInt32LE();
    }

    get dialinTick0(): number {
        return this._dialinTicks.readUInt16LE(0);
    }

    get dialinTick1(): number {
        return this._dialinTicks.readUInt16LE(2);
    }

    override toString() {
        return JSON.stringify(this);
    }
}

/**
 * Outbound MC_RACE_STARTED (msgNo 233 / 0xE9). Reply to MC_RACE_START telling
 * the client whether the race may start, and which racers are valid.
 *
 * Wire layout (40 bytes, pack(1)):
 *   WORD                  msgNo;        // offset 0, size 2
 *   MCOTS_INTRAID         raceID;       // offset 2, size 4
 *   BOOL                  okToStart;    // offset 6, size 4 (Win32 BOOL = int)
 *   StartingRacersResult  racers[6];    // offset 10, size 30 (6 * 5)
 *
 * Source struct: MCity/Server/MCDefs.h:1433 (StartRaceResultMsg).
 */
export class StartRaceResultMessage extends MessageNodeBody {
    private _msgNo;
    private _raceId; // 4
    private _okToStart; // 4 (BOOL)
    private _racers: StartingRacersResult[]; // 6 * 5

    constructor() {
        super();
        this._msgNo = 233; // MC_RACE_STARTED
        this._raceId = Buffer.alloc(4);
        this._okToStart = Buffer.alloc(4);
        this._racers = Array.from(
            { length: 6 },
            () => new StartingRacersResult(),
        );
    }

    override get sizeOf() {
        return 40;
    }

    private _doSerialize(): Buffer<ArrayBufferLike> {
        const msgNo = Buffer.alloc(2);
        msgNo.writeInt16LE(this._msgNo);
        const racersBuf = Buffer.concat(
            this._racers.map((r) => r.serialize()),
        );
        this.body_ = Buffer.concat([
            msgNo, // 0..2
            this._raceId, // 2..6
            this._okToStart, // 6..10
            racersBuf, // 10..40
        ]);
        return this.body_;
    }

    override serialize(): Buffer<ArrayBufferLike> {
        return this._doSerialize();
    }

    private _doDeSerialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        this.body_ = buf;
        this._msgNo = sliceBuff(buf, 0, 2).readInt16LE();
        this._raceId = sliceBuff(buf, 2, 4);
        this._okToStart = sliceBuff(buf, 6, 4);
        let offset = 10;
        for (let i = 0; i < 6; i++) {
            this._racers[i]!.deserialize(sliceBuff(buf, offset, 5));
            offset += 5;
        }
    }

    override deserialize(buf: Buffer): void {
        this._doDeSerialize(buf);
    }

    set raceId(val: number) {
        checkSize4(val);
        this._raceId.writeUInt32LE(val);
    }

    set okToStart(val: boolean) {
        // Win32 BOOL on the wire is a 4-byte int.
        this._okToStart.writeInt32LE(val ? 1 : 0);
    }

    /** Replace racer entry at the given slot (0..5). */
    setRacer(idx: number, id: number, isntValid = false) {
        if (idx < 0 || idx >= 6) {
            throw new RangeError(`racer index out of range: ${idx}`);
        }
        const r = this._racers[idx]!;
        r.id = id;
        r.isntValid = isntValid;
    }

    get raceId(): number {
        return this._raceId.readUInt32LE();
    }

    get okToStart(): boolean {
        return this._okToStart.readInt32LE() !== 0;
    }

    get racers(): readonly StartingRacersResult[] {
        return this._racers;
    }

    override toString() {
        return JSON.stringify(this);
    }
}
