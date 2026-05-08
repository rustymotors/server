import {
    checkMinLength,
    checkSize4,
    MessageNodeBody,
    sliceBuff,
} from "rusty-motors-shared";

/**
 * Inbound MC_CRC_POST_RACE_DATA (msgNo 435 / 0x01B3).
 *
 * Post-race counterpart to MC_CRC_PRE_RACE_DATA. Sent after the sim ends so
 * the server can compare each racer's post-race vehicle/model CRCs against
 * the pre-race CRCs saved during sequence-47 — any mismatch indicates a
 * cheater swapped parts or vehicles mid-race.
 *
 * Wire layout (pack(1), fixed 58 bytes):
 *   [0..1]    WORD             msgNo            (= 435)
 *   [2..5]    DWORD            checkSum         CRC of struct, computed with
 *                                                this field zero
 *   [6..9]    MCOTS_INTRAID    raceID           (DWORD)
 *   [10..57]  TypePostRacePlayerCRC playerCRC[4]  per-racer post-race CRCs
 *
 * Each TypePostRacePlayerCRC (12 bytes, pack(1)):
 *   [+0..3]   DWORD playerID
 *   [+4..7]   DWORD playerVehicleCRC
 *   [+8..11]  DWORD playerModelCRC
 *
 * Source struct: MCity/Server/MCDefs.h:2410 (CRCPostRaceData) +
 *                MCDefs.h:2391 (TypePostRacePlayerCRC).
 * Handler:       MCity/Server/MCRaces.cpp:1631 (MCRaces_CRCPostRaceData).
 */
export class CrcPostRaceDataMessage extends MessageNodeBody {
    static readonly MAX_PLAYERS = 4;
    static readonly PLAYER_RECORD_SIZE = 12;
    static readonly HEADER_SIZE = 10;
    static readonly FIXED_SIZE =
        CrcPostRaceDataMessage.HEADER_SIZE +
        CrcPostRaceDataMessage.MAX_PLAYERS *
            CrcPostRaceDataMessage.PLAYER_RECORD_SIZE; // 58

    private _msgNo: number;
    private _checkSum: Buffer; // 4
    private _raceId: Buffer; // 4
    private _playerIds: Uint32Array; // length 4
    private _playerVehicleCrcs: Uint32Array; // length 4
    private _playerModelCrcs: Uint32Array; // length 4

    constructor() {
        super();
        this._msgNo = 435;
        this._checkSum = Buffer.alloc(4);
        this._raceId = Buffer.alloc(4);
        this._playerIds = new Uint32Array(CrcPostRaceDataMessage.MAX_PLAYERS);
        this._playerVehicleCrcs = new Uint32Array(
            CrcPostRaceDataMessage.MAX_PLAYERS,
        );
        this._playerModelCrcs = new Uint32Array(
            CrcPostRaceDataMessage.MAX_PLAYERS,
        );
    }

    override get sizeOf(): number {
        return CrcPostRaceDataMessage.FIXED_SIZE;
    }

    override serialize(): Buffer<ArrayBufferLike> {
        const buf = Buffer.alloc(CrcPostRaceDataMessage.FIXED_SIZE);
        buf.writeUInt16LE(this._msgNo, 0);
        this._checkSum.copy(buf, 2);
        this._raceId.copy(buf, 6);
        for (let i = 0; i < CrcPostRaceDataMessage.MAX_PLAYERS; i++) {
            const off =
                CrcPostRaceDataMessage.HEADER_SIZE +
                i * CrcPostRaceDataMessage.PLAYER_RECORD_SIZE;
            buf.writeUInt32LE(this._playerIds[i]! >>> 0, off);
            buf.writeUInt32LE(this._playerVehicleCrcs[i]! >>> 0, off + 4);
            buf.writeUInt32LE(this._playerModelCrcs[i]! >>> 0, off + 8);
        }
        this.body_ = buf;
        return buf;
    }

    override deserialize(buf: Buffer): void {
        checkMinLength(buf, CrcPostRaceDataMessage.FIXED_SIZE);
        this.body_ = buf;
        this._msgNo = buf.readUInt16LE(0);
        this._checkSum = sliceBuff(buf, 2, 4);
        this._raceId = sliceBuff(buf, 6, 4);
        for (let i = 0; i < CrcPostRaceDataMessage.MAX_PLAYERS; i++) {
            const off =
                CrcPostRaceDataMessage.HEADER_SIZE +
                i * CrcPostRaceDataMessage.PLAYER_RECORD_SIZE;
            this._playerIds[i] = buf.readUInt32LE(off);
            this._playerVehicleCrcs[i] = buf.readUInt32LE(off + 4);
            this._playerModelCrcs[i] = buf.readUInt32LE(off + 8);
        }
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

    /**
     * Returns the four (playerId, playerVehicleCRC, playerModelCRC) records.
     * Slots that weren't filled by the client come through as zeros.
     */
    getPlayerCrcs(): {
        playerId: number;
        playerVehicleCRC: number;
        playerModelCRC: number;
    }[] {
        const out = new Array(CrcPostRaceDataMessage.MAX_PLAYERS);
        for (let i = 0; i < CrcPostRaceDataMessage.MAX_PLAYERS; i++) {
            out[i] = {
                playerId: this._playerIds[i]!,
                playerVehicleCRC: this._playerVehicleCrcs[i]!,
                playerModelCRC: this._playerModelCrcs[i]!,
            };
        }
        return out;
    }

    setPlayerCrc(
        slot: number,
        playerId: number,
        playerVehicleCRC: number,
        playerModelCRC: number,
    ): void {
        if (slot < 0 || slot >= CrcPostRaceDataMessage.MAX_PLAYERS) {
            throw new RangeError(
                `slot ${slot} out of range [0, ${CrcPostRaceDataMessage.MAX_PLAYERS})`,
            );
        }
        checkSize4(playerId);
        checkSize4(playerVehicleCRC);
        checkSize4(playerModelCRC);
        this._playerIds[slot] = playerId;
        this._playerVehicleCrcs[slot] = playerVehicleCRC;
        this._playerModelCrcs[slot] = playerModelCRC;
    }

    override toString(): string {
        return JSON.stringify({
            msgNo: this._msgNo,
            checkSum: this.checkSum,
            raceId: this.raceId,
            playerCrcs: this.getPlayerCrcs(),
        });
    }
}
