import {
    checkMinLength,
    checkSize4,
    MessageNodeBody,
    sliceBuff,
} from "rusty-motors-shared";

/**
 * Inbound MC_CRC_PRE_RACE_DATA (msgNo 434 / 0x01B2).
 *
 * Pre-race anti-cheat: after the client loads the track and cars but before
 * sim start, it sends CRCs over local game assets and per-racer car/parts
 * data so the server can verify nothing has been tampered with. The legacy
 * server compares the reported CRCs against authoritative values, sets
 * `bHasSentPreRaceCRC` for the racer, and OR-s mismatch flags into a
 * `suspiciousEventFlags` bitmask.
 *
 * Wire layout (pack(1)):
 *   [0..1]    WORD             msgNo            (= 434)
 *   [2..5]    DWORD            checkSum         CRC of the whole struct,
 *                                                computed with this field zero
 *   [6..9]    MCOTS_INTRAID    raceID           (DWORD)
 *   [10..13]  DWORD            trackCRC         track .frd file
 *   [14..17]  DWORD            sliceInfoCRC     sliceInfo.bin
 *   [18..21]  DWORD            pacejkaCRC       tire-model table
 *   [22..]    TypePreRacePlayerCRC playerCRC[4] per-racer car/parts CRCs
 *
 * Each TypePreRacePlayerCRC is fixed-size in the legacy header (16-byte
 * prefix + 60 * 8-byte TypePhysicsCRC = 496 bytes). However, observed
 * captures from the live client have a player-CRC region that is shorter
 * than 4 * 496 bytes — possibly because the client only fills slots for
 * actual racers, or because the wire format truncates trailing zero rows.
 * For now this parser keeps the player region as an opaque buffer and
 * leaves per-record decoding as a TODO.
 *
 * Source struct: MCity/Server/MCDefs.h:2398 (CRCPreRaceData).
 * Handler:       MCity/Server/MCRaces.cpp:1275 (MCRaces_CRCPreRaceData).
 */
export class CrcPreRaceDataMessage extends MessageNodeBody {
    static readonly HEADER_SIZE = 22;

    private _msgNo: number;
    private _checkSum: Buffer; // 4
    private _raceId: Buffer; // 4
    private _trackCRC: Buffer; // 4
    private _sliceInfoCRC: Buffer; // 4
    private _pacejkaCRC: Buffer; // 4
    private _playersBlob: Buffer; // variable

    constructor() {
        super();
        this._msgNo = 434;
        this._checkSum = Buffer.alloc(4);
        this._raceId = Buffer.alloc(4);
        this._trackCRC = Buffer.alloc(4);
        this._sliceInfoCRC = Buffer.alloc(4);
        this._pacejkaCRC = Buffer.alloc(4);
        this._playersBlob = Buffer.alloc(0);
    }

    override get sizeOf(): number {
        return CrcPreRaceDataMessage.HEADER_SIZE + this._playersBlob.byteLength;
    }

    override serialize(): Buffer<ArrayBufferLike> {
        const buf = Buffer.alloc(this.sizeOf);
        buf.writeUInt16LE(this._msgNo, 0);
        this._checkSum.copy(buf, 2);
        this._raceId.copy(buf, 6);
        this._trackCRC.copy(buf, 10);
        this._sliceInfoCRC.copy(buf, 14);
        this._pacejkaCRC.copy(buf, 18);
        this._playersBlob.copy(buf, 22);
        this.body_ = buf;
        return buf;
    }

    override deserialize(buf: Buffer): void {
        checkMinLength(buf, CrcPreRaceDataMessage.HEADER_SIZE);
        this.body_ = buf;
        this._msgNo = buf.readUInt16LE(0);
        this._checkSum = sliceBuff(buf, 2, 4);
        this._raceId = sliceBuff(buf, 6, 4);
        this._trackCRC = sliceBuff(buf, 10, 4);
        this._sliceInfoCRC = sliceBuff(buf, 14, 4);
        this._pacejkaCRC = sliceBuff(buf, 18, 4);
        const tail = buf.byteLength - CrcPreRaceDataMessage.HEADER_SIZE;
        this._playersBlob = sliceBuff(buf, CrcPreRaceDataMessage.HEADER_SIZE, tail);
    }

    get checkSum(): number {
        return this._checkSum.readUInt32LE();
    }

    set checkSum(val: number) {
        checkSize4(val);
        this._checkSum.writeUInt32LE(val);
    }

    get raceId(): number {
        return this._raceId.readUInt32LE();
    }

    set raceId(val: number) {
        checkSize4(val);
        this._raceId.writeUInt32LE(val);
    }

    get trackCRC(): number {
        return this._trackCRC.readUInt32LE();
    }

    set trackCRC(val: number) {
        checkSize4(val);
        this._trackCRC.writeUInt32LE(val);
    }

    get sliceInfoCRC(): number {
        return this._sliceInfoCRC.readUInt32LE();
    }

    set sliceInfoCRC(val: number) {
        checkSize4(val);
        this._sliceInfoCRC.writeUInt32LE(val);
    }

    get pacejkaCRC(): number {
        return this._pacejkaCRC.readUInt32LE();
    }

    set pacejkaCRC(val: number) {
        checkSize4(val);
        this._pacejkaCRC.writeUInt32LE(val);
    }

    /**
     * Raw per-racer CRC region (defensive copy). Decode TODO — see class doc.
     * Length matches the inbound wire size minus the 22-byte header.
     */
    get playersBlob(): Buffer {
        return Buffer.from(this._playersBlob);
    }

    setPlayersBlob(bytes: Buffer): void {
        this._playersBlob = Buffer.from(bytes);
    }

    override toString(): string {
        return JSON.stringify({
            msgNo: this._msgNo,
            checkSum: this.checkSum,
            raceId: this.raceId,
            trackCRC: this.trackCRC,
            sliceInfoCRC: this.sliceInfoCRC,
            pacejkaCRC: this.pacejkaCRC,
            playersBlobBytes: this._playersBlob.byteLength,
        });
    }
}
