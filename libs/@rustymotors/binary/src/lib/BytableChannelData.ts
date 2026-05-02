import { BytableObject } from "./types.js";
import { BareCString } from "./BareCString.js";
import { BytableBitField } from "./BytableBitField.js";
import { BytableByte } from "./BytableByte.js";
import { BytableDword } from "./BytableDword.js";
import { BytablePad } from "./BytablePad.js";

const NPS_GAMENAME_LEN = 64;
const K_MAX_PLAYER_NAME = 30;
const NPS_CHANNEL_DATA_SIZE = 256;

interface SimpleField {
    readonly serializeSize: number;
    serialize(): Buffer;
    deserialize(buf: Buffer): void;
}

/**
 * tsMCom_Pkt_GameData — room channel data blob.
 *
 * MSVC default packing (32-bit, little-endian). Wire layout:
 *   +0   raceID              int32 LE
 *   +4   raceName[64]        char[64]  (NPS_GAMENAME_LEN)
 *   +68  entryFee            int32 LE
 *   +72  purseBonusPerPlayer int32 LE
 *   +76  purseBonusPerRace   int32 LE
 *   +80  (maxNPSracers:4 | minNPSracers:4<<4)  uint8
 *   +81  (numRounds:4 | numLaps:4<<4)           uint8
 *   +82  flags: backwardRace:0, mirrored:1, nightDriving:2,
 *                weatherDriving:3, damageMode:4-5, traffic:6, handicapped:7
 *   +83  1 byte padding (align mode to 4 bytes)
 *   +84  mode                eRoomMode = int32 LE
 *   +88  sponsorBPT          uint32 LE
 *   +92  minlevel            uint8
 *   +93  maxlevel            uint8
 *   +94  requiredBodyClass   uint8
 *   +95  maxPowerClass       uint8
 *   +96  bDisallowNOS:1      BOOL bitfield (4-byte int storage unit)
 *   +100 (raceInProgress:1 | connectedPlayers:4<<1)  char bitfield
 *   +101 3 bytes padding (align hostID to 4 bytes)
 *   +104 hostID              uint32 LE
 *   +108 hostName[30]        char[30]  (kMAX_PLAYER_NAME)
 *   +138 2 bytes padding (align userID[6] to 4 bytes)
 *   +140 userID[6]           uint32[6] LE
 *   +164 dbCarID[6]          int32[6]  LE
 *   +188 dbBptID[6]          int32[6]  LE
 *   +212 majorVersionNum     uint32 LE
 *   +216 minorVersionNum     uint32 LE
 *   +220 revisionVersionNum  uint32 LE
 *   +224 (end of struct, padded to 256 bytes)
 */
export class BytableChannelData implements BytableObject {
    protected name_: string = "channelData";

    private _raceID              = BytableChannelData._si32();
    private _raceName            = new BareCString(NPS_GAMENAME_LEN);
    private _entryFee            = BytableChannelData._si32();
    private _purseBonusPerPlayer = BytableChannelData._si32();
    private _purseBonusPerRace   = BytableChannelData._si32();
    private _byte80              = new BytableBitField(); // maxNPSracers:4 | minNPSracers:4<<4
    private _byte81              = new BytableBitField(); // numRounds:4    | numLaps:4<<4
    private _byte82              = new BytableBitField(); // race flags
    private _pad83               = new BytablePad(1);
    private _mode                = BytableChannelData._si32();
    private _sponsorBPT          = BytableChannelData._ui32();
    private _minlevel            = new BytableByte();
    private _maxlevel            = new BytableByte();
    private _requiredBodyClass   = new BytableByte();
    private _maxPowerClass       = new BytableByte();
    private _bDisallowNOS        = BytableChannelData._si32(); // BOOL as int32
    private _byte100             = new BytableBitField(); // raceInProgress:1 | connectedPlayers:4<<1
    private _pad101              = new BytablePad(3);
    private _hostID              = BytableChannelData._ui32();
    private _hostName            = new BareCString(K_MAX_PLAYER_NAME);
    private _pad138              = new BytablePad(2);
    private _userID              = Array.from({ length: 6 }, () => BytableChannelData._ui32());
    private _dbCarID             = Array.from({ length: 6 }, () => BytableChannelData._si32());
    private _dbBptID             = Array.from({ length: 6 }, () => BytableChannelData._si32());
    private _majorVersionNum     = BytableChannelData._ui32();
    private _minorVersionNum     = BytableChannelData._ui32();
    private _revisionVersionNum  = BytableChannelData._ui32();
    private _pad224              = new BytablePad(32);

    private static _si32(val = 0): BytableDword {
        const d = new BytableDword();
        const b = Buffer.alloc(4);
        b.writeInt32LE(val);
        d.setValue(b);
        return d;
    }

    private static _ui32(val = 0): BytableDword {
        const d = new BytableDword();
        const b = Buffer.alloc(4);
        b.writeUInt32LE(val);
        d.setValue(b);
        return d;
    }

    private get _fields(): SimpleField[] {
        return [
            this._raceID,
            this._raceName,
            this._entryFee,
            this._purseBonusPerPlayer,
            this._purseBonusPerRace,
            this._byte80,
            this._byte81,
            this._byte82,
            this._pad83,
            this._mode,
            this._sponsorBPT,
            this._minlevel,
            this._maxlevel,
            this._requiredBodyClass,
            this._maxPowerClass,
            this._bDisallowNOS,
            this._byte100,
            this._pad101,
            this._hostID,
            this._hostName,
            this._pad138,
            ...this._userID,
            ...this._dbCarID,
            ...this._dbBptID,
            this._majorVersionNum,
            this._minorVersionNum,
            this._revisionVersionNum,
            this._pad224,
        ];
    }

    get serializeSize(): number { return NPS_CHANNEL_DATA_SIZE; }

    serialize(): Buffer {
        const buf = Buffer.alloc(NPS_CHANNEL_DATA_SIZE, 0);
        let offset = 0;
        for (const f of this._fields) {
            f.serialize().copy(buf, offset);
            offset += f.serializeSize;
        }
        return buf;
    }

    deserialize(buffer: Buffer): void {
        let offset = 0;
        for (const f of this._fields) {
            f.deserialize(buffer.subarray(offset));
            offset += f.serializeSize;
        }
    }

    get json() {
        return {
            name: this.name_,
            serializeSize: this.serializeSize,
            value: this.serialize().toString("hex"),
        };
    }

    setName(name: string) { this.name_ = name; }
    get name() { return this.name_; }

    get value(): Buffer { return this.serialize(); }
    setValue(_value: string | number | Buffer): void {
        throw new Error('BytableChannelData: use field setters instead of setValue');
    }

    getUint16(offset: number): number { return this.serialize().readUInt16BE(offset); }
    getUint32(offset: number): number { return this.serialize().readUInt32BE(offset); }
    toHexString(): string { return this.serialize().toString("hex"); }

    private static _readI32(d: BytableDword): number { return (d.value as Buffer).readInt32LE(0); }
    private static _writeI32(d: BytableDword, val: number): void { const b = Buffer.alloc(4); b.writeInt32LE(val); d.setValue(b); }
    private static _readU32(d: BytableDword): number { return (d.value as Buffer).readUInt32LE(0); }
    private static _writeU32(d: BytableDword, val: number): void { const b = Buffer.alloc(4); b.writeUInt32LE(val); d.setValue(b); }

    get raceID(): number { return BytableChannelData._readI32(this._raceID); }
    set raceID(val: number) { BytableChannelData._writeI32(this._raceID, val); }

    get raceName(): string { return this._raceName.toString(); }
    set raceName(val: string) { this._raceName.set(val); }

    get entryFee(): number { return BytableChannelData._readI32(this._entryFee); }
    set entryFee(val: number) { BytableChannelData._writeI32(this._entryFee, val); }
    get purseBonusPerPlayer(): number { return BytableChannelData._readI32(this._purseBonusPerPlayer); }
    set purseBonusPerPlayer(val: number) { BytableChannelData._writeI32(this._purseBonusPerPlayer, val); }
    get purseBonusPerRace(): number { return BytableChannelData._readI32(this._purseBonusPerRace); }
    set purseBonusPerRace(val: number) { BytableChannelData._writeI32(this._purseBonusPerRace, val); }

    get maxNPSracers(): number { return this._byte80.value & 0x0f; }
    set maxNPSracers(val: number) { this._byte80.setValue((this._byte80.value & 0xf0) | (val & 0x0f)); }
    get minNPSracers(): number { return (this._byte80.value >> 4) & 0x0f; }
    set minNPSracers(val: number) { this._byte80.setValue((this._byte80.value & 0x0f) | ((val & 0x0f) << 4)); }

    get numRounds(): number { return this._byte81.value & 0x0f; }
    set numRounds(val: number) { this._byte81.setValue((this._byte81.value & 0xf0) | (val & 0x0f)); }
    get numLaps(): number { return (this._byte81.value >> 4) & 0x0f; }
    set numLaps(val: number) { this._byte81.setValue((this._byte81.value & 0x0f) | ((val & 0x0f) << 4)); }

    get backwardRace(): boolean { return (this._byte82.value & 0x01) !== 0; }
    set backwardRace(val: boolean) { this._byte82.setValue(val ? this._byte82.value | 0x01 : this._byte82.value & 0xfe); }
    get mirrored(): boolean { return (this._byte82.value & 0x02) !== 0; }
    set mirrored(val: boolean) { this._byte82.setValue(val ? this._byte82.value | 0x02 : this._byte82.value & 0xfd); }
    get nightDriving(): boolean { return (this._byte82.value & 0x04) !== 0; }
    set nightDriving(val: boolean) { this._byte82.setValue(val ? this._byte82.value | 0x04 : this._byte82.value & 0xfb); }
    get weatherDriving(): boolean { return (this._byte82.value & 0x08) !== 0; }
    set weatherDriving(val: boolean) { this._byte82.setValue(val ? this._byte82.value | 0x08 : this._byte82.value & 0xf7); }
    get damageMode(): number { return (this._byte82.value >> 4) & 0x03; }
    set damageMode(val: number) { this._byte82.setValue((this._byte82.value & 0xcf) | ((val & 0x03) << 4)); }
    get traffic(): boolean { return (this._byte82.value & 0x40) !== 0; }
    set traffic(val: boolean) { this._byte82.setValue(val ? this._byte82.value | 0x40 : this._byte82.value & 0xbf); }
    get handicapped(): boolean { return (this._byte82.value & 0x80) !== 0; }
    set handicapped(val: boolean) { this._byte82.setValue(val ? this._byte82.value | 0x80 : this._byte82.value & 0x7f); }

    get mode(): number { return BytableChannelData._readI32(this._mode); }
    set mode(val: number) { BytableChannelData._writeI32(this._mode, val); }
    get sponsorBPT(): number { return BytableChannelData._readU32(this._sponsorBPT); }
    set sponsorBPT(val: number) { BytableChannelData._writeU32(this._sponsorBPT, val); }

    get minlevel(): number { return this._minlevel.value; }
    set minlevel(val: number) { this._minlevel.setValue(val); }
    get maxlevel(): number { return this._maxlevel.value; }
    set maxlevel(val: number) { this._maxlevel.setValue(val); }
    get requiredBodyClass(): number { return this._requiredBodyClass.value; }
    set requiredBodyClass(val: number) { this._requiredBodyClass.setValue(val); }
    get maxPowerClass(): number { return this._maxPowerClass.value; }
    set maxPowerClass(val: number) { this._maxPowerClass.setValue(val); }

    get bDisallowNOS(): boolean { return BytableChannelData._readI32(this._bDisallowNOS) !== 0; }
    set bDisallowNOS(val: boolean) { BytableChannelData._writeI32(this._bDisallowNOS, val ? 1 : 0); }

    get raceInProgress(): boolean { return (this._byte100.value & 0x01) !== 0; }
    set raceInProgress(val: boolean) { this._byte100.setValue(val ? this._byte100.value | 0x01 : this._byte100.value & 0xfe); }
    get connectedPlayers(): number { return (this._byte100.value >> 1) & 0x0f; }
    set connectedPlayers(val: number) { this._byte100.setValue((this._byte100.value & 0xe1) | ((val & 0x0f) << 1)); }

    get hostID(): number { return BytableChannelData._readU32(this._hostID); }
    set hostID(val: number) { BytableChannelData._writeU32(this._hostID, val); }
    get hostName(): string { return this._hostName.toString(); }
    set hostName(val: string) { this._hostName.set(val); }

    getUserID(index: number): number { return BytableChannelData._readU32(this._userID[index]!); }
    setUserID(index: number, val: number): void { BytableChannelData._writeU32(this._userID[index]!, val); }
    getDbCarID(index: number): number { return BytableChannelData._readI32(this._dbCarID[index]!); }
    setDbCarID(index: number, val: number): void { BytableChannelData._writeI32(this._dbCarID[index]!, val); }
    getDbBptID(index: number): number { return BytableChannelData._readI32(this._dbBptID[index]!); }
    setDbBptID(index: number, val: number): void { BytableChannelData._writeI32(this._dbBptID[index]!, val); }

    get majorVersionNum(): number { return BytableChannelData._readU32(this._majorVersionNum); }
    set majorVersionNum(val: number) { BytableChannelData._writeU32(this._majorVersionNum, val); }
    get minorVersionNum(): number { return BytableChannelData._readU32(this._minorVersionNum); }
    set minorVersionNum(val: number) { BytableChannelData._writeU32(this._minorVersionNum, val); }
    get revisionVersionNum(): number { return BytableChannelData._readU32(this._revisionVersionNum); }
    set revisionVersionNum(val: number) { BytableChannelData._writeU32(this._revisionVersionNum, val); }
}
