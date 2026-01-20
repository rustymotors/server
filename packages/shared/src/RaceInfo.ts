import {
    Bool,
    checkMinLength,
    checkSize4,
    CString,
    padBuffer,
    sliceBuff,
} from './helpers.js';
import { MessageNodeBody } from './MessageNode.js';
import type { Serializable } from './types.js';

export class RaceInfo implements Serializable {
    private _raceId; // 4
    private _createTime; // 4
    private _initialStartTime; // 4
    private _lastKeepAlive; // 4
    private _lobbyId; // 4
    private _qualifyingTime; // 4
    private _entryFee; // 4
    private _purse; // 4
    private _purseBonusPerPlayer; // 4
    private _purseBonusPerRace; // 4
    private _eventId; // 4
    private _raceHistoryId; // 4
    private _timeTrialQualifyingPointsAward; // 2
    private _timeTrialQuialiyingCashAward; // 2
    private _timeTrialBonusPointsAward; // 1
    private _timeTrialBonusCashAward; // 1
    private _timeTrialBonusIncrementTicks; // 2
    private _lobbyFlags; // 4
    private _racePointsFactor; // 4 - float
    private _raceCashFactor; // 4 - float
    private _trackCRC; // 4
    private _sliceInfoCRC; // 4
    private _dialInTicks; // 2
    private _numberSlices; // 2
    private _numberLaps; // 2
    private _startSlice; // 2
    private _endSlice; // 2
    private _minLevel; // 2
    private _timeTrialNumberLaps; // 2
    private _clubNumLaps; // 2
    private _raceType; // 1
    private _turfId; // 1
    private _multiRoundLimit; // 1
    private _racingState: RaceState; // 1
    private _numberHumanPlayers; // 1
    private _numberAIPlayers; // 1
    private _humanResultsCount; // 1
    private _aiResultsCount; // 1
    private _isPlinkSlipRace; // 1
    private _isClubRace; // 1
    private _isRaceSponsored; // 1
    private _isTeamTrialRace; // 1
    private _isRaceInvalid; // 1
    private _isNOSDisallowed; // 1
    private _partPrizesMax; // 2
    private _powerClassId; // 2
    private _bodyClassId; // 2
    private _password: CString; // 8
    private _multiRoundWinners; // 2
    private _racers: RacerList;
    private _placement: RacerSortedList;
    private _timeTrialBaseTimeUnderPar; // 2

    constructor() {
        this._raceId = Buffer.alloc(4);
        this._createTime = Buffer.alloc(4);
        this._initialStartTime = Buffer.alloc(4);
        this._lastKeepAlive = Buffer.alloc(4);
        this._lobbyId = Buffer.alloc(4);
        this._qualifyingTime = Buffer.alloc(4);
        this._entryFee = Buffer.alloc(4);
        this._purse = Buffer.alloc(4);
        this._purseBonusPerPlayer = Buffer.alloc(4);
        this._purseBonusPerRace = Buffer.alloc(4);
        this._eventId = Buffer.alloc(4);
        this._raceHistoryId = Buffer.alloc(4);
        this._timeTrialQualifyingPointsAward = Buffer.alloc(2);
        this._timeTrialQuialiyingCashAward = Buffer.alloc(2);
        this._timeTrialBonusPointsAward = Buffer.alloc(1);
        this._timeTrialBonusCashAward = Buffer.alloc(1);
        this._timeTrialBonusIncrementTicks = Buffer.alloc(2);
        this._lobbyFlags = Buffer.alloc(4);
        this._racePointsFactor = Buffer.alloc(4);
        this._raceCashFactor = Buffer.alloc(4);
        this._trackCRC = Buffer.alloc(4);
        this._sliceInfoCRC = Buffer.alloc(4);
        this._dialInTicks = Buffer.alloc(2);
        this._numberSlices = Buffer.alloc(2);
        this._numberLaps = Buffer.alloc(2);
        this._startSlice = Buffer.alloc(2);
        this._endSlice = Buffer.alloc(2);
        this._minLevel = Buffer.alloc(2);
        this._timeTrialNumberLaps = Buffer.alloc(2);
        this._clubNumLaps = Buffer.alloc(2);
        this._raceType = Buffer.alloc(1);
        this._turfId = Buffer.alloc(1);
        this._multiRoundLimit = Buffer.alloc(1);
        this._racingState = RaceState.Empty;
        this._numberHumanPlayers = Buffer.alloc(1);
        this._numberAIPlayers = Buffer.alloc(1);
        this._humanResultsCount = Buffer.alloc(1);
        this._aiResultsCount = Buffer.alloc(1);
        this._isPlinkSlipRace = new Bool();
        this._isClubRace = new Bool();
        this._isRaceSponsored = new Bool();
        this._isTeamTrialRace = new Bool();
        this._isRaceInvalid = new Bool();
        this._isNOSDisallowed = new Bool();
        this._partPrizesMax = Buffer.alloc(2);
        this._powerClassId = Buffer.alloc(2);
        this._bodyClassId = Buffer.alloc(2);
        this._password = new CString(8);
        this._multiRoundWinners = Buffer.alloc(2);
        this._racers = new RacerList();
        this._placement = new RacerSortedList();
        this._timeTrialBaseTimeUnderPar = Buffer.alloc(2);
    }

    get sizeOf() {
        return (
            116 +
            this._password.sizeOf +
            this._racers.sizeOf +
            this._placement.sizeOf
        );
    }

    serialize() {
        const racingState = Buffer.alloc(1);
        racingState.writeInt8(this._racingState);
        return Buffer.concat([
            this._raceId,
            this._createTime,
            this._initialStartTime,
            this._lastKeepAlive,
            this._lobbyId,
            this._qualifyingTime,
            this._entryFee,
            this._purse,
            this._purseBonusPerPlayer,
            this._purseBonusPerRace,
            this._eventId,
            this._raceHistoryId,
            this._timeTrialQualifyingPointsAward,
            this._timeTrialQuialiyingCashAward,
            this._timeTrialBonusPointsAward,
            this._timeTrialBonusCashAward,
            this._timeTrialBonusIncrementTicks,
            this._lobbyFlags,
            this._racePointsFactor,
            this._raceCashFactor,
            this._trackCRC,
            this._sliceInfoCRC,
            this._dialInTicks,
            this._numberSlices,
            this._numberLaps,
            this._startSlice,
            this._endSlice,
            this._minLevel,
            this._timeTrialNumberLaps,
            this._clubNumLaps,
            this._raceType,
            this._turfId,
            this._multiRoundLimit,
            racingState,
            this._numberHumanPlayers,
            this._numberAIPlayers,
            this._humanResultsCount,
            this._aiResultsCount,
            this._isPlinkSlipRace.serialize(),
            this._isClubRace.serialize(),
            this._isRaceSponsored.serialize(),
            this._isTeamTrialRace.serialize(),
            this._isRaceInvalid.serialize(),
            this._isNOSDisallowed.serialize(),
            this._partPrizesMax,
            this._powerClassId,
            this._bodyClassId,
            this._password.serialize(),
            this._multiRoundWinners,
            this._racers.serialize(),
            this._placement.serialize(),
            this._timeTrialBaseTimeUnderPar,
        ]);
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        let offset = 0;
        this._raceId = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._createTime = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._initialStartTime = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._lastKeepAlive = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._lobbyId = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._qualifyingTime = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._entryFee = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._purse = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._purseBonusPerPlayer = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._purseBonusPerRace = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._eventId = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._raceHistoryId = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._timeTrialQualifyingPointsAward = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._timeTrialQuialiyingCashAward = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._timeTrialBonusPointsAward = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._timeTrialBonusCashAward = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._timeTrialBonusIncrementTicks = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._lobbyFlags = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._racePointsFactor = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._raceCashFactor = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._trackCRC = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._sliceInfoCRC = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._dialInTicks = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._numberSlices = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._numberLaps = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._startSlice = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._endSlice = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._minLevel = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._timeTrialNumberLaps = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._clubNumLaps = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._raceType = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._turfId = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._multiRoundLimit = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._racingState = sliceBuff(buf, offset, 1).readInt8();
        offset = offset + 1;
        this._numberHumanPlayers = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._numberAIPlayers = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._humanResultsCount = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._aiResultsCount = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._isPlinkSlipRace.deserialize(sliceBuff(buf, offset, 1));
        offset = offset + 1;
        this._isClubRace.deserialize(sliceBuff(buf, offset, 1));
        offset = offset + 1;
        this._isRaceSponsored.deserialize(sliceBuff(buf, offset, 1));
        offset = offset + 1;
        this._isTeamTrialRace.deserialize(sliceBuff(buf, offset, 1));
        offset = offset + 1;
        this._isRaceInvalid.deserialize(sliceBuff(buf, offset, 1));
        offset = offset + 1;
        this._isNOSDisallowed.deserialize(sliceBuff(buf, offset, 1));
        offset = offset + 1;
        this._partPrizesMax = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._powerClassId = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._bodyClassId = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._password.deserialize(buf.subarray(offset));
        offset = offset + this._password.sizeOf;
        this._multiRoundWinners = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._racers.deserialize(buf.subarray(offset));
        offset = offset + this._racers.sizeOf;
        this._placement.deserialize(buf.subarray(offset));
        offset = offset + this._placement.sizeOf;
        this._timeTrialBaseTimeUnderPar = sliceBuff(buf, offset, 2);
    }
}

export class Racer implements Serializable {
    private _id; // 4
    private _connectionId; // 4
    private _clubId; // 4
    private _vehicleId; // 4
    private _raceTime; // 4
    private _bestLapTime; // 4
    private _topSpeedMPS100; // 2
    private _avgSpeed; // 2
    private _prizeId; // 4
    private _cashWon; // 4
    private _racePoints; // 2
    private _resultFlags; // 4
    private _status: RacerStatus; // 1
    private _isHuman: Bool = new Bool(); // 1
    private _wantsToRaceAgain: Bool = new Bool(); // 1
    private _numRoundsWon; // 1
    private _hasSentPreRaceCRC: Bool = new Bool(); // 1
    private _hasSentPostRaceCRC: Bool = new Bool(); // 1
    private _canCheat: Bool = new Bool(); // 1
    private _preRaceScrapValue; // 4
    private _violationEventFlags; // 4
    private _bestRoundTimeTicks; // 4
    private _hignestRoundTopSpeedMPS100; // 4
    private _savedCarCRCs: PostRacePlayerCRCList; // [4]

    constructor() {
        this._id = Buffer.alloc(4);
        this._connectionId = Buffer.alloc(4);
        this._clubId = Buffer.alloc(4);
        this._vehicleId = Buffer.alloc(4);
        this._raceTime = Buffer.alloc(4);
        this._bestLapTime = Buffer.alloc(4);
        this._topSpeedMPS100 = Buffer.alloc(2);
        this._avgSpeed = Buffer.alloc(2);
        this._prizeId = Buffer.alloc(4);
        this._cashWon = Buffer.alloc(4);
        this._racePoints = Buffer.alloc(2);
        this._resultFlags = Buffer.alloc(4);
        this._status = RacerStatus.Empty;
        this._isHuman.value = false;
        this._wantsToRaceAgain.value = false;
        this._numRoundsWon = Buffer.alloc(1);
        this._hasSentPreRaceCRC.value = false;
        this._hasSentPostRaceCRC.value = false;
        this._canCheat.value = false;
        this._preRaceScrapValue = Buffer.alloc(4);
        this._violationEventFlags = Buffer.alloc(4);
        this._bestRoundTimeTicks = Buffer.alloc(4);
        this._hignestRoundTopSpeedMPS100 = Buffer.alloc(4);
        this._savedCarCRCs = new PostRacePlayerCRCList();
    }

    get sizeOf() {
        return 65 + this._savedCarCRCs.sizeOf;
    }

    serialize() {
        const status = Buffer.alloc(1);
        status.writeInt8(this._status);
        return Buffer.concat([
            this._id,
            this._connectionId,
            this._clubId,
            this._vehicleId,
            this._raceTime,
            this._bestLapTime,
            this._topSpeedMPS100,
            this._avgSpeed,
            this._prizeId,
            this._cashWon,
            this._racePoints,
            this._resultFlags,
            status,
            this._isHuman.serialize(),
            this._wantsToRaceAgain.serialize(),
            this._numRoundsWon,
            this._hasSentPreRaceCRC.serialize(),
            this._hasSentPostRaceCRC.serialize(),
            this._canCheat.serialize(),
            this._preRaceScrapValue,
            this._violationEventFlags,
            this._bestRoundTimeTicks,
            this._hignestRoundTopSpeedMPS100,
            this._savedCarCRCs.serialize(),
        ]);
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        let offset = 0;
        this._id = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._connectionId = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._clubId = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._vehicleId = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._raceTime = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._bestLapTime = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._topSpeedMPS100 = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._avgSpeed = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._prizeId = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._cashWon = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._racePoints = sliceBuff(buf, offset, 2);
        offset = offset + 2;
        this._resultFlags = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._status = sliceBuff(buf, offset, 1).readInt8();
        offset = offset + 1;
        this._isHuman.deserialize(sliceBuff(buf, offset, 1));
        offset = offset + 1;
        this._wantsToRaceAgain.deserialize(sliceBuff(buf, offset, 1));
        offset = offset + 1;
        this._numRoundsWon = sliceBuff(buf, offset, 1);
        offset = offset + 1;
        this._hasSentPreRaceCRC.deserialize(sliceBuff(buf, offset, 1));
        offset = offset + 1;
        this._hasSentPostRaceCRC.deserialize(sliceBuff(buf, offset, 1));
        offset = offset + 1;
        this._canCheat.deserialize(sliceBuff(buf, offset, 1));
        offset = offset + 1;
        this._preRaceScrapValue = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._violationEventFlags = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._bestRoundTimeTicks = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._hignestRoundTopSpeedMPS100 = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._savedCarCRCs.deserialize(buf.subarray(offset));
    }
}

export class RacerList implements Serializable {
    private _items: Racer[];
    private _itemSize;

    constructor() {
        this._items = [];
        this._itemSize = 65 + 12 * 4;
    }

    get sizeOf() {
        if (this._items[1]) {
            return 2 + this._items[1].sizeOf * this._items.length;
        } else {
            return 2;
        }
    }
    serialize() {
        const length = Buffer.alloc(2);
        length.writeInt16LE(this._items.length);
        const items = this._items.map((item) => {
            return item.serialize();
        });
        return Buffer.concat([length, Buffer.concat(items)]);
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, 2);
        let offset = 0;
        const length = sliceBuff(buf, offset, 2).readInt16LE();
        if (length > 0) {
            for (let i = 0; i < length; i++) {
                checkMinLength(buf, this._itemSize);
                const item = new Racer();
                item.deserialize(sliceBuff(buf, offset, this._itemSize));
                offset = offset + this._itemSize;
                this._items.push(item);
            }
        }
    }
}

export class RacerSorted implements Serializable {
    private _racerIndex; // 4
    private _completeTime; // 4

    constructor() {
        this._racerIndex = Buffer.alloc(4);
        this._completeTime = Buffer.alloc(4);
    }

    get sizeOf() {
        return 8;
    }

    serialize() {
        return Buffer.concat([this._racerIndex, this._completeTime]);
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, 8);
        this._racerIndex = sliceBuff(buf, 0, 4);
        this._completeTime = sliceBuff(buf, 4, 4);
    }
}

export class RacerSortedList implements Serializable {
    private _items: RacerSorted[];
    private _itemSize;

    constructor() {
        this._items = [];
        this._itemSize = 8;
    }

    get sizeOf() {
        return 8;
    }

    serialize() {
        const length = Buffer.alloc(2);
        length.writeInt16LE(this._items.length);
        const items = this._items.map((item) => {
            return item.serialize();
        });
        return Buffer.concat([length, Buffer.concat(items)]);
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, 2);
        let offset = 0;
        const length = sliceBuff(buf, offset, 2).readInt16LE();
        if (length > 0) {
            for (let i = 0; i < length; i++) {
                checkMinLength(buf, this._itemSize);
                const item = new RacerSorted();
                item.deserialize(sliceBuff(buf, offset, this._itemSize));
                offset = offset + this._itemSize;
                this._items.push(item);
            }
        }
    }
}

export class PostRacePlayerCRC implements Serializable {
    private _playerId; // 4
    private _playerVehicleCRC; // 4
    private _playerModelCRC; // 4

    constructor() {
        this._playerId = Buffer.alloc(4);
        this._playerVehicleCRC = Buffer.alloc(4);
        this._playerModelCRC = Buffer.alloc(4);
    }

    get sizeOf() {
        return 12;
    }

    serialize() {
        return Buffer.concat([
            this._playerId,
            this._playerVehicleCRC,
            this._playerModelCRC,
        ]);
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        let offset = 0;
        this._playerId = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._playerVehicleCRC = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._playerModelCRC = sliceBuff(buf, offset, 4);
    }
}

export class PostRacePlayerCRCList implements Serializable {
    private _items: PostRacePlayerCRC[];
    private _itemSize = 12;

    constructor() {
        this._items = [];
    }

    get sizeOf() {
        return 2 + 12 * this._items.length;
    }

    serialize() {
        const length = Buffer.alloc(2);
        length.writeInt16LE(this._items.length);
        const items = this._items.map((item) => {
            return item.serialize();
        });
        return Buffer.concat([length, Buffer.concat(items)]);
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, 2);
        let offset = 0;
        const length = sliceBuff(buf, offset, 2).readInt16LE();
        if (length > 0) {
            for (let i = 0; i < length; i++) {
                checkMinLength(buf, this._itemSize);
                const item = new PostRacePlayerCRC();
                item.deserialize(sliceBuff(buf, offset, this._itemSize));
                offset = offset + this._itemSize;
                this._items.push(item);
            }
        }
    }
}

export enum RacerStatus {
    Empty = 0,
    Racing = 1,
    Aborted = 3,
    Faulted = 4,
    DidNotFinish = 5,
    Quit = 6,
    Finished = 7,
}

export enum RaceState {
    Empty = 0,
    Racing = 1,
    RoundResolved = 2,
    RacersResolved = 3,
}

export const MAX_HUMANS_ALLOWED_IN_RACE = 4;

export class RaceCreatedMessage extends MessageNodeBody {
    private _msgNo;
    private _raceId; // 2
    private _entryFee; // 4
    private _perPlayerPurseBonus; // 4
    private _password; // cstring[8]
    private _raceHistoryId; // 4
    private _perRacePurseBonus; // 4

    constructor() {
        super();
        this._msgNo = 223; // MC_RACE_CREATE_OK
        this._raceId = Buffer.alloc(4);
        this._entryFee = Buffer.alloc(4);
        this._perPlayerPurseBonus = Buffer.alloc(4);
        this._password = new CString(8);
        this._raceHistoryId = Buffer.alloc(4);
        this._perRacePurseBonus = Buffer.alloc(4);
    }

    override get sizeOf() {
        return 22 + this._password.sizeOf;
    }

    private _doSerialize(): Buffer<ArrayBufferLike> {
        const msgNo = Buffer.alloc(2);
        msgNo.writeInt16LE(this._msgNo);
        this.body_ = Buffer.concat([
            msgNo,
            this._raceId,
            this._entryFee,
            this._perPlayerPurseBonus,
            this._password.serialize(),
            this._raceHistoryId,
            this._perRacePurseBonus,
        ]);
        return this.body_;
    }

    override serialize(): Buffer<ArrayBufferLike> {
        return this._doSerialize();
    }

    private _doDeSerialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        this.body_ = buf;
        let offset = 0;
        this.msgNumber = sliceBuff(buf, offset, 2).readInt16LE();
        offset = offset + 4;
        this._entryFee = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._perPlayerPurseBonus = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._password.deserialize(buf.subarray(offset));
        offset = offset + this._password.sizeOf;
        this._raceHistoryId = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._perRacePurseBonus = sliceBuff(buf, offset, 4);
    }

    override deserialize(buf: Buffer): void {
        this._doDeSerialize(buf);
    }

    set raceId(val: number) {
        checkSize4(val);
        this._raceId.writeInt32LE(val);
    }

    set entryFee(val: number) {
        checkSize4(val);
        this._entryFee.writeInt32LE(val);
    }

    set perPlayerPurseBonus(val: number) {
        checkSize4(val);
        this._perPlayerPurseBonus.writeInt32LE(val);
    }

    setPassword(val: string) {
        this._password.set(val);
    }

    set raceHistoryId(val: number) {
        checkSize4(val);
        this._raceHistoryId.writeInt32LE(val);
    }

    set perRacePurseBonus(val: number) {
        checkSize4(val);
        this._perRacePurseBonus.writeInt32LE(val);
    }

    override toString() {
        return JSON.stringify(this);
    }
}

export class JoinRaceMessage extends MessageNodeBody {
    private _msgNo;
    private _raceId; // 4
    private _vehicleId; // 4
    private _powerClass; // 1
    // 1 byte padding

    constructor() {
        super();
        this._msgNo = 0;
        this._raceId = Buffer.alloc(4);
        this._vehicleId = Buffer.alloc(4);
        this._powerClass = Buffer.alloc(1);
    }

    override get sizeOf() {
        return 12;
    }

    private _doSerialize(): Buffer<ArrayBufferLike> {
        const msgNo = Buffer.alloc(2);
        msgNo.writeInt16LE(this._msgNo);
        this.body_ = padBuffer(
            Buffer.concat([
                msgNo,
                this._raceId,
                this._vehicleId,
                this._powerClass,
            ]),
        );
        return this.body_;
    }

    override serialize(): Buffer<ArrayBufferLike> {
        return this._doSerialize();
    }

    private _doDeSerialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        this.body_ = buf;
        let offset = 0;
        this._msgNo = sliceBuff(buf, offset, 2).readInt16LE();
        offset = offset + 2;
        this._raceId = sliceBuff(buf, offset, 4);
        offset += 4;
        this._vehicleId = sliceBuff(buf, offset, 4);
        offset = offset + 4;
        this._powerClass = sliceBuff(buf, offset, 1);
    }

    override deserialize(buf: Buffer): void {
        this._doDeSerialize(buf);
    }

    override toString() {
        return JSON.stringify(this);
    }
}

export class RaceJoinedMessage extends MessageNodeBody {
    private _msgNo; // 4
    private _raceId; // 4
    private _password; // 8

    constructor() {
        super();
        this._msgNo = 224; // MC_RACE_JOIN_OK
        this._raceId = Buffer.alloc(4);
        this._password = new CString(8);
    }

    override get sizeOf() {
        return 8 + this._password.sizeOf;
    }

    private _doSerialize(): Buffer<ArrayBufferLike> {
        const msgNo = Buffer.alloc(2);
        msgNo.writeInt16LE(this._msgNo);
        this.body_ = Buffer.concat([
            msgNo,
            this._raceId,
            this._password.serialize(),
        ]);
        return this.body_;
    }

    override serialize(): Buffer<ArrayBufferLike> {
        return this._doSerialize();
    }

    private _doDeSerialize(buf: Buffer) {
        checkMinLength(buf, this.sizeOf);
        this.body_ = buf;
        let offset = 0;
        this.msgNumber = sliceBuff(buf, offset, 2).readInt16LE();
        offset = offset + 4;
        this._password.deserialize(buf.subarray(offset));
    }

    override deserialize(buf: Buffer): void {
        this._doDeSerialize(buf);
    }

    set raceId(val: number) {
        checkSize4(val);
        this._raceId.writeInt32LE(val);
    }

    setPassword(val: string) {
        this._password.set(val);
    }

    override toString() {
        return JSON.stringify(this);
    }
}
