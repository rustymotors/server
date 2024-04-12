/// <reference types="node" />
import { SerializedBuffer } from "rusty-shared";
/**
 * A message listing the lobbies
 * This is the body of a MessageNode
 */
export declare class LobbyMessage extends SerializedBuffer {
    _msgNo: number;
    _lobbyCount: number;
    _shouldExpectMoreMessages: boolean;
    _lobbyList: LobbyInfo[];
    constructor();
    size(): number;
    /**
     * Add a lobby to the list
     * @param {LobbyInfo} lobby
     */
    addLobby(lobby: LobbyInfo): void;
    serialize(): Buffer;
    toString(): string;
}
export declare class LobbyInfo extends SerializedBuffer {
    _lobbyId: number;
    _raceTypeId: number;
    _terfId: number;
    _lobbyName: string;
    _turfName: string;
    _clientArt: string;
    _elementId: number;
    _turfLengthId: number;
    _startSlice: number;
    _endSlice: number;
    _dragStageLeft: number;
    _dragStageRight: number;
    _dragStagingSlice: number;
    _gridSpreadFactor: number;
    _linear: number;
    _minNumberPlayers: number;
    _maxNumberPlayers: number;
    _defaultNumberPlayers: number;
    _numberOfPlayersEnabled: boolean;
    _minLaps: number;
    _maxLaps: number;
    _defaultNumberOfLaps: number;
    _numberOfLapsEnabled: boolean;
    _minNumberRounds: number;
    _maxNumberRounds: number;
    _defaultNumberRounds: number;
    _numberOfRoundsEnabled: boolean;
    _defaultWeather: number;
    _weatherEnabled: boolean;
    _defaultNight: number;
    _nightEnabled: boolean;
    _defaultBackwards: boolean;
    _backwardsEnabled: boolean;
    _defaultTraffic: boolean;
    _trafficEnabled: boolean;
    _defaultDriverAI: boolean;
    _driverAIEnabled: boolean;
    _topDog: string;
    _turfOwner: string;
    _qualifyingTime: number;
    _numberOfClubPlayers: number;
    _numberofClubLaps: number;
    _numberOfClubRounds: number;
    _clubNight: number;
    _clubWeather: number;
    _clubBackwards: number;
    _bestLapTime: number;
    _lobbyDifficulty: number;
    _timetrialPointsToQualify: number;
    _timetrialCashToQualify: number;
    _timetrialPointsBonusIncrements: number;
    _timetrialCashBonusIncrements: number;
    _timetrialTimeIncrements: number;
    _timetrial1stPlaceVictoryPoints: number;
    _timetrial1stPlaceVictoryCash: number;
    _timetrial2ndPlaceVictoryPoints: number;
    _timetrial2ndPlaceVictoryCash: number;
    _timetrial3rdPlaceVictoryPoints: number;
    _timetrial3rdPlaceVictoryCash: number;
    _minLevel: number;
    _minResetSlice: number;
    _maxResetSlice: number;
    _newbieFlag: number;
    _driverHelmetFlag: number;
    _clubMaxNumberPlayers: number;
    _clubMinNumberPlayers: number;
    _clubNumberPlayersDefault: number;
    _minNumberOfClubs: number;
    _maxNumberOfClubs: number;
    _racePointsFactor: number;
    _maxBodyClass: number;
    _maxPowerClass: number;
    _partsPrizeMax: number;
    _partsPrizeWon: number;
    _clubLogoId: number;
    _teamTrialsWeatherFlag: boolean;
    _teamTrialsNightFlag: boolean;
    _teamTrialsBackwardsFlag: boolean;
    _teamTrialsNumberLaps: number;
    _teamTrialsBaseTimeUnderPar: number;
    _raceCashFactor: number;
    constructor();
    /**
     * Deserialize a 2 byte boolean
     *
     * @param {Buffer} data
     * @returns {boolean}
     */
    deserializeBool(data: Buffer): boolean;
    /**
     * Serialize a 2 byte boolean
     *
     * @param {number} value
     * @returns {Buffer}
     */
    serializeBool(value: number): Buffer;
    size(): number;
    /**
     * Deserialize the data
     *
     * @param {Buffer} data
     */
    deserialize(data: Buffer): this;
    serialize(): Buffer;
    toString(): string;
}
