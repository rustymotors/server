import { Serializable } from "./types.js";


export class RaceInfo implements Serializable {
    private _raceId;
    private _createrTime;
    private _initialStartTime;
    private _lastKeepAlive;
    private _lobbyId;
    private _qualifyingTime;
    private _entryFee;
    private _purse;
    private _purseBonusPerPlayer;
    private _purseBonusPerRace;
    private _eventId;
    private _raceHistoryId;
    private _timeTrialQualifyingPointsAward;
    private _timeTrialQuialiyingCaseAward;
    private _timeTrialBonusPointsAward;
    private _timeTrialBonusCashAward;
    private _timeTrialBonusIncrementTicks;
    private _lobbyFlags;
    private _racePointsFactor;
    private _raceCashFactor;
    private _trackCRC;
    private _sliceInfoCRC;
    private _dialInTicks;
    private _numberSlices;
    private _numberLaps;
    private _startSlice;
    private _endSlice;
    private _minLevel;
    private _timeTrialNumberLaps;
    private _clubNumLaps;
    private _raceType;
    private _turfId;
    private _multiRoundLimit;
    private _racingState: RaceState;
    private _numberHumanPlayers;
    private _numberAIPlayers;
    private _humanResultsCount;
    private _aiResultsCount;
    private _isPlinkSlipRace;
    private _isClubRace;
    private _isRaceSponsored;
    private _isTeamTrialRace;
    private _isRaceInvalid;
    private _isNOSDisallowed;
    private _partPrizesMax;
    private _powerClassId;
    private _bodyClassId;
    private _password;
    private _multiRoundWinners;
    private _racers: RacerList;
    private _placement: RacerSortedList;
    private _timeTrialBaseTimeUnderPar;

}

export class Racer implements Serializable {
    private _id;
    private _connectionId;
    private _clubId;
    private _vehicleId;
    private _raceTime;
    private _bestLapTime;
    private _topSpeedMPS100;
    private _avgSpeed;
    private _prizeId;
    private _cashWon;
    private _racePoints;
    private _resultFlags;
    private _isHuman;
    private _wantsToRaceAgain;
    private _status: RacerStatus;
    private _numRoundsWon;
    private _preRaceScrapValue;
    private _savedCarCRCs: PostRacePlayerCRCList; // 4 entries
    private _hasSentPreRaceCRC;
    private _hasSentPostRaceCRC;
    private _canCheat;
    private _violationEventFlags;
    private _bestRoundTimeTicks;
    private _hignestRoundTopSpeedMPS100;
}


export class RacerList implements Serializable {
    private _items: Racer[];
}

export class RacerSorted implements Serializable {
    private _racerIndex;
    private _completeTime;
}

export class RacerSortedList implements Serializable {
    private _items: RacerSorted[];
}

export class PostRacePlayerCRC implements Serializable {
    private _playerId;
    private _playerVehicleCRC;
    private _playerModelCRC;
}

export class PostRacePlayerCRCList implements Serializable {
    private _items: PostRacePlayerCRC;
    private _maxValues = 4;
}

export enum RacerStatus {
    Empty = 0,
    Racing = 1,
    Aborted = 3,
    Faulted = 4,
    DidNotFinish = 5,
    Quit = 6,
    Finished = 7
}

export enum RaceState {
    Empty = 0,
    Racing = 1,
    RoundResolved = 2,
    RacersResolved = 3
}

export const MAX_HUMANS_ALLOWED_IN_RACE = 4;
export const MAX_AI_ALLOWED_IN_RACE = 4;

