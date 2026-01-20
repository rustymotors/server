import { Bool, checkMinLength, padBuffer, sliceBuff } from './helpers.js';
import { MessageNodeBody } from './MessageNode.js';
import type { Serializable } from './types.js';

export class CreateRaceMessage extends MessageNodeBody {
    private _msgNo; // 2
    private _lobbyId; // 4
    private _entryFee; // 4
    private _isClubRace: Bool; // 1
    private _isPinkSlipRace: Bool; // 1
    private _isTeamTrial: Bool; // 1
    private _sponsorId; // 4
    private _info: CreateRaceInfo;

    constructor() {
        super();
        this._msgNo = Buffer.alloc(4);
        this._lobbyId = Buffer.alloc(4);
        this._entryFee = Buffer.alloc(4);
        this._isClubRace = new Bool();
        this._isPinkSlipRace = new Bool();
        this._isTeamTrial = new Bool();
        this._sponsorId = Buffer.alloc(4);
        this._info = new CreateRaceInfo();
    }

    override get sizeOf() {
        return 2 + 4 + 4 + 1 + 1 + 1 + 4 + this._info.sizeOf;
    }

    override serialize() {
        this.body_ = Buffer.concat([
            this._msgNo,
            this._lobbyId,
            this._entryFee,
            this._isClubRace.serialize(),
            this._isPinkSlipRace.serialize(),
            this._isTeamTrial.serialize(),
            this._sponsorId,
        ]);
        return this.body_;
    }

    override deserialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        this.body_ = buf;
        let offset = 0;
        this._msgNo = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._lobbyId = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._entryFee = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._isClubRace.deserialize(sliceBuff(buf, offset, 1));
        offset + offset + 1;
        this._isClubRace.deserialize(sliceBuff(buf, offset, 1));
        offset = offset + 1;
        this._isTeamTrial.deserialize(sliceBuff(buf, offset, 1));
        offset = offset + 1;
        this._sponsorId = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._info.deserialize(buf.subarray(offset));
    }

    get msgNo() {
        return this._msgNo.readUint32LE();
    } // 2
    get lobbyId() {
        return this._lobbyId.readUint32LE();
    } // 4
    get entryFee() {
        return this._entryFee.readUint32LE();
    } // 4
    get isClubRace() {
        return this._isClubRace.value;
    }
    get isPinkSlipRace() {
        return this._isPinkSlipRace.value;
    }
    get isTeamTrial() {
        return this._isTeamTrial.value;
    }
    get sponsorId() {
        return this._isTeamTrial.value;
    } // 4
    get info(): CreateRaceInfo {
        return this._info;
    }

    override toString(): string {
        return JSON.stringify(this);
    }
}
export class CreateRaceInfo implements Serializable {
    private _minLevel; // 4
    private _maxLevel; // 4
    private _maxHP; // 4
    private _maxRacers; // 1
    private _minRacers; // 1
    private _numRounds; // 1
    private _numLaps; // 1
    private _isRaceBackwards; // 1
    private _isRaceMirrored; // 1
    private _isRaceAtNight; // 1
    private _doesRaceHaveWeather; // 1
    private _doesRaceHaveDamage; // 1
    private _doesRaceHaveTraffic; // 1
    private _doesRaceHaveAI; // 1
    private _isRaceHandicapped; // 1
    private _powerClass; // 4
    private _bodyClass; // 4
    private _isNOSDisallowed; // 1

    constructor() {
        this._minLevel = Buffer.alloc(4);
        this._maxLevel = Buffer.alloc(4);
        this._maxHP = Buffer.alloc(4);
        this._maxRacers = Buffer.alloc(1);
        this._minRacers = Buffer.alloc(1);
        this._numRounds = Buffer.alloc(1);
        this._numLaps = Buffer.alloc(1);
        this._isRaceBackwards = Buffer.alloc(1);
        this._isRaceMirrored = Buffer.alloc(1);
        this._isRaceAtNight = Buffer.alloc(1);
        this._doesRaceHaveWeather = Buffer.alloc(1);
        this._doesRaceHaveDamage = Buffer.alloc(1);
        this._doesRaceHaveTraffic = Buffer.alloc(1);
        this._doesRaceHaveAI = Buffer.alloc(1);
        this._isRaceHandicapped = Buffer.alloc(1);
        this._powerClass = Buffer.alloc(4);
        this._bodyClass = Buffer.alloc(4);
        this._isNOSDisallowed = Buffer.alloc(1);
    }

    get sizeOf() {
        return 33;
    }

    serialize() {
        return padBuffer(
            Buffer.concat([
                this._minLevel,
                this._maxLevel,
                this._maxHP,
                this._maxRacers,
                this._minRacers,
                this._numRounds,
                this._numLaps,
                this._isRaceBackwards,
                this._isRaceMirrored,
                this._isRaceAtNight,
                this._doesRaceHaveWeather,
                this._doesRaceHaveDamage,
                this._doesRaceHaveTraffic,
                this._doesRaceHaveAI,
                this._isRaceHandicapped,
                this._powerClass,
                this._bodyClass,
                this._isNOSDisallowed,
            ]),
        );
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        let offset = 0;
        this._minLevel = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._maxLevel = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._maxHP = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._maxRacers = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._minRacers = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._numRounds = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._numLaps = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._isRaceBackwards = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._isRaceMirrored = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._isRaceAtNight = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._doesRaceHaveWeather = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._doesRaceHaveDamage = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._doesRaceHaveTraffic = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._doesRaceHaveAI = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._isRaceHandicapped = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._powerClass = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._bodyClass = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._isNOSDisallowed = sliceBuff(buf, offset, 1);
    }
}
