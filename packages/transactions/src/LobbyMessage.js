// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

/**
 * A message listing the lobbies
 * This is the body of a MessageNode
 */
export class LobbyMessage {
    /**
     * Creates an instance of TLobbyMessage.
     * @param {import("pino").Logger} log
     */
    constructor(log) {
        log.debug("new TLobbyMessage");
        this._msgNo = 0; // 2 bytes
        this._lobbyCount = 0; // 2 bytes
        this._shouldExpectMoreMessages = false; // 1 byte
        /** @type {LobbyInfo[]} */
        this._lobbyList = []; // 563 bytes each
    }

    get size() {
        return 5 + this._lobbyList.length * 563;
    }

    /**
     * Add a lobby to the list
     * @param {LobbyInfo} lobby
     */
    addLobby(lobby) {
        this._lobbyList.push(lobby);
        this._lobbyCount++;
    }

    serialize() {
        const buf = Buffer.alloc(this.size);
        let offset = 0;
        buf.writeUInt16BE(this._msgNo, offset);
        offset += 2;
        buf.writeUInt16BE(this._lobbyCount, offset);
        offset += 2;
        buf.writeUInt8(this._shouldExpectMoreMessages ? 1 : 0, offset);
        offset += 1;
        for (const lobby of this._lobbyList) {
            buf.set(lobby.serialize(), offset);
            offset += lobby.size;
        }
        return buf;
    }

    toString() {
        return `LobbyMessage: msgNo=${this._msgNo} lobbyCount=${this._lobbyCount} shouldExpectMoreMessages=${this._shouldExpectMoreMessages} lobbies=${this._lobbyList.length}`;
    }
}

export class LobbyInfo {
    /**
     * Creates an instance of LobbyInfo.
     * @param {import("pino").Logger} log
     */
    constructor(log) {
        log.debug("new LobbyInfo");
        this._lobbyId = 0; // 4 bytes
        this._raceTypeId = 0; // 4 bytes
        this._terfId = 0; // 4 bytes
        this._lobbyName = ""; // 32 bytes
        this._turfName = ""; // 256 bytes
        this._clientArt = ""; // 11 bytes
        this._elementId = 0; // 4 bytes
        this._turfLengthId = 0; // 4 bytes
        this._startSlice = 0; // 4 bytes
        this._endSlice = 0; // 4 bytes
        this._dragStageLeft = 0; // 4 bytes
        this._dragStageRight = 0; // 4 bytes
        this._dragStagingSlice = 0; // 4 bytes
        this._gridSpreadFactor = 0; // 4 bytes
        this._linear = 0; // 2 bytes
        this._minNumberPlayers = 0; // 2 bytes
        this._maxNumberPlayers = 0; // 2 bytes
        this._defaultNumberPlayers = 0; // 2 bytes
        this._numberOfPlayersEnabled = false; // 2 bytes
        this._minLaps = 0; // 2 bytes
        this._maxLaps = 0; // 2 bytes
        this._defaultNumberOfLaps = 0; // 2 bytes
        this._numberOfLapsEnabled = false; // 2 bytes
        this._minNumberRounds = 0; // 2 bytes
        this._maxNumberRounds = 0; // 2 bytes
        this._defaultNumberRounds = 0; // 2 bytes
        this._numberOfRoundsEnabled = false; // 2 bytes
        this._defaultWeather = 0; // 2 bytes
        this._weatherEnabled = false; // 2 bytes
        this._defaultNight = 0; // 2 bytes
        this._nightEnabled = false; // 2 bytes
        this._defaultBackwards = false; // 2 bytes
        this._backwardsEnabled = false; // 2 bytes
        this._defaultTraffic = false; // 2 bytes
        this._trafficEnabled = false; // 2 bytes
        this._defaultDriverAI = false; // 2 bytes
        this._driverAIEnabled = false; // 2 bytes
        this._topDog = ""; // 13 bytes
        this._turfOwner = ""; // 33 bytes
        this._qualifyingTime = 0; // 4 bytes
        this._numberOfClubPlayers = 0; // 4 bytes
        this._numberofClubLaps = 0; // 4 bytes
        this._numberOfClubRounds = 0; // 4 bytes
        this._clubNight = 0; // 2 bytes
        this._clubWeather = 0; // 2 bytes
        this._clubBackwards = 0; // 2 bytes
        this._bestLapTime = 0; // 4 bytes
        this._lobbyDifficulty = 0; // 4 bytes
        this._timetrialPointsToQualify = 0; // 4 bytes
        this._timetrialCashToQualify = 0; // 4 bytes
        this._timetrialPointsBonusIncrements = 0; // 4 bytes
        this._timetrialCashBonusIncrements = 0; // 4 bytes
        this._timetrialTimeIncrements = 0; // 4 bytes
        this._timetrial1stPlaceVictoryPoints = 0; // 4 bytes
        this._timetrial1stPlaceVictoryCash = 0; // 4 bytes
        this._timetrial2ndPlaceVictoryPoints = 0; // 4 bytes
        this._timetrial2ndPlaceVictoryCash = 0; // 4 bytes
        this._timetrial3rdPlaceVictoryPoints = 0; // 4 bytes
        this._timetrial3rdPlaceVictoryCash = 0; // 4 bytes
        this._minLevel = 0; // 2 bytes
        this._minResetSlice = 0; // 4 bytes
        this._maxResetSlice = 0; // 4 bytes
        this._newbieFlag = 0; // 2 bytes
        this._driverHelmetFlag = 0; // 2 bytes
        this._clubMaxNumberPlayers = 0; // 2 bytes
        this._clubMinNumberPlayers = 0; // 2 bytes
        this._clubNumberPlayersDefault = 0; // 2 bytes
        this._minNumberOfClubs = 0; // 2 bytes
        this._maxNumberOfClubs = 0; // 2 bytes
        this._racePointsFactor = 0; // 4 bytes
        this._maxBodyClass = 0; // 2 bytes
        this._maxPowerClass = 0; // 2 bytes
        this._partsPrizeMax = 0; // 2 bytes
        this._partsPrizeWon = 0; // 2 bytes
        this._clubLogoId = 0; // 4 bytes
        this._teamTrialsWeatherFlag = false; // 2 bytes
        this._teamTrialsNightFlag = false; // 2 bytes
        this._teamTrialsBackwardsFlag = false; // 2 bytes
        this._teamTrialsNumberLaps = 0; // 2 bytes
        this._teamTrialsBaseTimeUnderPar = 0; // 2 bytes
        this._raceCashFactor = 0; // 4 bytes
    }

    /**
     * Deserialize a 2 byte boolean
     *
     * @param {Buffer} data
     * @returns {boolean}
     */
    deserializeBool(data) {
        return data.readUInt16BE() === 1;
    }

    /**
     * Serialize a 2 byte boolean
     *
     * @param {number} value
     * @returns {Buffer}
     */
    serializeBool(value) {
        const buf = Buffer.alloc(2);
        buf.writeUInt16BE(value ? 1 : 0);
        return buf;
    }

    get size() {
        return 563;
    }

    /**
     * Deserialize the data
     *
     * @param {Buffer} data
     */
    deserialize(data) {
        if (data.length !== this.size) {
            throw new Error(
                `Data length ${data.length} does not expected length ${this.size}`,
            );
        }
        let offset = 0;
        this._lobbyId = data.readUInt32BE(offset);
        offset += 4;
        this._raceTypeId = data.readUInt32BE(offset);
        offset += 4;
        this._terfId = data.readUInt32BE(offset);
        offset += 4;
        this._lobbyName = data.toString("utf8", offset, offset + 32);
        offset += 32;
        this._turfName = data.toString("utf8", offset, offset + 256);
        offset += 256;
        this._clientArt = data.toString("utf8", offset, offset + 11);
        offset += 11;
        this._elementId = data.readUInt32BE(offset);
        offset += 4;
        this._turfLengthId = data.readUInt32BE(offset);
        offset += 4;
        this._startSlice = data.readUInt32BE(offset);
        offset += 4;
        this._endSlice = data.readUInt32BE(offset);
        offset += 4;
        this._dragStageLeft = data.readUInt32BE(offset);
        offset += 4;
        this._dragStageRight = data.readUInt32BE(offset);
        offset += 4;
        this._dragStagingSlice = data.readUInt32BE(offset);
        offset += 4;
        this._gridSpreadFactor = data.readUInt32BE(offset);
        offset += 4;
        this._linear = data.readUInt16BE(offset);
        offset += 2;
        this._minNumberPlayers = data.readUInt16BE(offset);
        offset += 2;
        this._maxNumberPlayers = data.readUInt16BE(offset);
        offset += 2;
        this._defaultNumberPlayers = data.readUInt16BE(offset);
        offset += 2;
        this._numberOfPlayersEnabled = this.deserializeBool(
            data.subarray(offset, offset + 2),
        );
        offset += 2;
        this._minLaps = data.readUInt16BE(offset);
        offset += 2;
        this._maxLaps = data.readUInt16BE(offset);
        offset += 2;
        this._defaultNumberOfLaps = data.readUInt16BE(offset);
        offset += 2;
        this._numberOfLapsEnabled = this.deserializeBool(
            data.subarray(offset, offset + 2),
        );
        offset += 2;
        this._minNumberRounds = data.readUInt16BE(offset);
        offset += 2;
        this._maxNumberRounds = data.readUInt16BE(offset);
        offset += 2;
        this._defaultNumberRounds = data.readUInt16BE(offset);
        offset += 2;
        this._numberOfRoundsEnabled = this.deserializeBool(
            data.subarray(offset, offset + 2),
        );
        offset += 2;
        this._defaultWeather = data.readUInt16BE(offset);
        offset += 2;
        this._weatherEnabled = this.deserializeBool(
            data.subarray(offset, offset + 2),
        );
        offset += 2;
        this._defaultNight = data.readUInt16BE(offset);
        offset += 2;
        this._nightEnabled = this.deserializeBool(
            data.subarray(offset, offset + 2),
        );
        offset += 2;
        this._defaultBackwards = this.deserializeBool(
            data.subarray(offset, offset + 2),
        );
        offset += 2;
        this._backwardsEnabled = this.deserializeBool(
            data.subarray(offset, offset + 2),
        );
        offset += 2;
        this._defaultTraffic = this.deserializeBool(
            data.subarray(offset, offset + 2),
        );
        offset += 2;
        this._trafficEnabled = this.deserializeBool(
            data.subarray(offset, offset + 2),
        );
        offset += 2;
        this._defaultDriverAI = this.deserializeBool(
            data.subarray(offset, offset + 2),
        );
        offset += 2;
        this._driverAIEnabled = this.deserializeBool(
            data.subarray(offset, offset + 2),
        );
        offset += 2;
        this._topDog = data.toString("utf8", offset, offset + 13);
        offset += 13;
        this._turfOwner = data.toString("utf8", offset, offset + 33);
        offset += 33;
        this._qualifyingTime = data.readUInt32BE(offset);
        offset += 4;
        this._numberOfClubPlayers = data.readUInt32BE(offset);
        offset += 4;
        this._numberofClubLaps = data.readUInt32BE(offset);
        offset += 4;
        this._numberOfClubRounds = data.readUInt32BE(offset);
        offset += 4;
        this._clubNight = data.readUInt16BE(offset);
        offset += 2;
        this._clubWeather = data.readUInt16BE(offset);
        offset += 2;
        this._clubBackwards = data.readUInt16BE(offset);
        offset += 2;
        this._bestLapTime = data.readUInt32BE(offset);
        offset += 4;
        this._lobbyDifficulty = data.readUInt32BE(offset);
        offset += 4;
        this._timetrialPointsToQualify = data.readUInt32BE(offset);
        offset += 4;
        this._timetrialCashToQualify = data.readUInt32BE(offset);
        offset += 4;
        this._timetrialPointsBonusIncrements = data.readUInt32BE(offset);
        offset += 4;
        this._timetrialCashBonusIncrements = data.readUInt32BE(offset);
        offset += 4;
        this._timetrialTimeIncrements = data.readUInt32BE(offset);
        offset += 4;
        this._timetrial1stPlaceVictoryPoints = data.readUInt32BE(offset);
        offset += 4;
        this._timetrial1stPlaceVictoryCash = data.readUInt32BE(offset);
        offset += 4;
        this._timetrial2ndPlaceVictoryPoints = data.readUInt32BE(offset);
        offset += 4;
        this._timetrial2ndPlaceVictoryCash = data.readUInt32BE(offset);
        offset += 4;
        this._timetrial3rdPlaceVictoryPoints = data.readUInt32BE(offset);
        offset += 4;
        this._timetrial3rdPlaceVictoryCash = data.readUInt32BE(offset);
        offset += 4;
        this._minLevel = data.readUInt16BE(offset);
        offset += 2;
        this._minResetSlice = data.readUInt32BE(offset);
        offset += 4;
        this._maxResetSlice = data.readUInt32BE(offset);
        offset += 4;
        this._newbieFlag = data.readUInt16BE(offset);
        offset += 2;
        this._driverHelmetFlag = data.readUInt16BE(offset);
        offset += 2;
        this._clubMaxNumberPlayers = data.readUInt16BE(offset);
        offset += 2;
        this._clubMinNumberPlayers = data.readUInt16BE(offset);
        offset += 2;
        this._clubNumberPlayersDefault = data.readUInt16BE(offset);
        offset += 2;
        this._minNumberOfClubs = data.readUInt16BE(offset);
        offset += 2;
        this._maxNumberOfClubs = data.readUInt16BE(offset);
        offset += 2;
        this._racePointsFactor = data.readUInt32BE(offset);
        offset += 4;
        this._maxBodyClass = data.readUInt16BE(offset);
        offset += 2;
        this._maxPowerClass = data.readUInt16BE(offset);
        offset += 2;
        this._partsPrizeMax = data.readUInt16BE(offset);
        offset += 2;
        this._partsPrizeWon = data.readUInt16BE(offset);
        offset += 2;
        this._clubLogoId = data.readUInt32BE(offset);
        offset += 4;
        this._teamTrialsWeatherFlag = this.deserializeBool(
            data.subarray(offset, offset + 2),
        );
        offset += 2;
        this._teamTrialsNightFlag = this.deserializeBool(
            data.subarray(offset, offset + 2),
        );
        offset += 2;
        this._teamTrialsBackwardsFlag = this.deserializeBool(
            data.subarray(offset, offset + 2),
        );
        offset += 2;
        this._teamTrialsNumberLaps = data.readUInt16BE(offset);
        offset += 2;
        this._teamTrialsBaseTimeUnderPar = data.readUInt16BE(offset);
        offset += 2;
        this._raceCashFactor = data.readUInt32BE(offset);
        offset += 4; // 563 total bytes

        return this;
    }

    serialize() {
        const buf = Buffer.alloc(this.size);
        let offset = 0;
        buf.writeUInt32BE(this._lobbyId, offset);
        offset += 4;
        buf.writeUInt32BE(this._raceTypeId, offset);
        offset += 4;
        buf.writeUInt32BE(this._terfId, offset);
        offset += 4;
        buf.write(this._lobbyName, offset, 32);
        offset += 32;
        buf.write(this._turfName, offset, 256);
        offset += 256;
        buf.write(this._clientArt, offset, 11);
        offset += 11;
        buf.writeUInt32BE(this._elementId, offset);
        offset += 4;
        buf.writeUInt32BE(this._turfLengthId, offset);
        offset += 4;
        buf.writeUInt32BE(this._startSlice, offset);
        offset += 4;
        buf.writeUInt32BE(this._endSlice, offset);
        offset += 4;
        buf.writeUInt32BE(this._dragStageLeft, offset);
        offset += 4;
        buf.writeUInt32BE(this._dragStageRight, offset);
        offset += 4;
        buf.writeUInt32BE(this._dragStagingSlice, offset);
        offset += 4;
        buf.writeUInt32BE(this._gridSpreadFactor, offset);
        offset += 4;
        buf.writeUInt16BE(this._linear, offset);
        offset += 2;
        buf.writeUInt16BE(this._minNumberPlayers, offset);
        offset += 2;
        buf.writeUInt16BE(this._maxNumberPlayers, offset);
        offset += 2;
        buf.writeUInt16BE(this._defaultNumberPlayers, offset);
        offset += 2;
        buf.writeUInt16BE(this._numberOfPlayersEnabled ? 1 : 0, offset);
        offset += 2;
        buf.writeUInt16BE(this._minLaps, offset);
        offset += 2;
        buf.writeUInt16BE(this._maxLaps, offset);
        offset += 2;
        buf.writeUInt16BE(this._defaultNumberOfLaps, offset);
        offset += 2;
        buf.writeUInt16BE(this._numberOfLapsEnabled ? 1 : 0, offset);
        offset += 2;
        buf.writeUInt16BE(this._minNumberRounds, offset);
        offset += 2;
        buf.writeUInt16BE(this._maxNumberRounds, offset);
        offset += 2;
        buf.writeUInt16BE(this._defaultNumberRounds, offset);
        offset += 2;
        buf.writeUInt16BE(this._numberOfRoundsEnabled ? 1 : 0, offset);
        offset += 2;
        buf.writeUInt16BE(this._defaultWeather, offset);
        offset += 2;
        buf.writeUInt16BE(this._weatherEnabled ? 1 : 0, offset);
        offset += 2;
        buf.writeUInt16BE(this._defaultNight, offset);
        offset += 2;
        buf.writeUInt16BE(this._nightEnabled ? 1 : 0, offset);
        offset += 2;
        buf.writeUInt16BE(this._defaultBackwards ? 1 : 0, offset);
        offset += 2;
        buf.writeUInt16BE(this._backwardsEnabled ? 1 : 0, offset);
        offset += 2;
        buf.writeUInt16BE(this._defaultTraffic ? 1 : 0, offset);
        offset += 2;
        buf.writeUInt16BE(this._trafficEnabled ? 1 : 0, offset);
        offset += 2;
        buf.writeUInt16BE(this._defaultDriverAI ? 1 : 0, offset);
        offset += 2;
        buf.writeUInt16BE(this._driverAIEnabled ? 1 : 0, offset);
        offset += 2;
        buf.write(this._topDog, offset, 13);
        offset += 13;
        buf.write(this._turfOwner, offset, 33);
        offset += 33;
        buf.writeUInt32BE(this._qualifyingTime, offset);
        offset += 4;
        buf.writeUInt32BE(this._numberOfClubPlayers, offset);
        offset += 4;
        buf.writeUInt32BE(this._numberofClubLaps, offset);
        offset += 4;
        buf.writeUInt32BE(this._numberOfClubRounds, offset);
        offset += 4;
        buf.writeUInt16BE(this._clubNight, offset);
        offset += 2;
        buf.writeUInt16BE(this._clubWeather, offset);
        offset += 2;
        buf.writeUInt16BE(this._clubBackwards, offset);
        offset += 2;
        buf.writeUInt32BE(this._bestLapTime, offset);
        offset += 4;
        buf.writeUInt32BE(this._lobbyDifficulty, offset);
        offset += 4;
        buf.writeUInt32BE(this._timetrialPointsToQualify, offset);
        offset += 4;
        buf.writeUInt32BE(this._timetrialCashToQualify, offset);
        offset += 4;
        buf.writeUInt32BE(this._timetrialPointsBonusIncrements, offset);
        offset += 4;
        buf.writeUInt32BE(this._timetrialCashBonusIncrements, offset);
        offset += 4;
        buf.writeUInt32BE(this._timetrialTimeIncrements, offset);
        offset += 4;
        buf.writeUInt32BE(this._timetrial1stPlaceVictoryPoints, offset);
        offset += 4;
        buf.writeUInt32BE(this._timetrial1stPlaceVictoryCash, offset);
        offset += 4;
        buf.writeUInt32BE(this._timetrial2ndPlaceVictoryPoints, offset);
        offset += 4;
        buf.writeUInt32BE(this._timetrial2ndPlaceVictoryCash, offset);
        offset += 4;
        buf.writeUInt32BE(this._timetrial3rdPlaceVictoryPoints, offset);
        offset += 4;
        buf.writeUInt32BE(this._timetrial3rdPlaceVictoryCash, offset);
        offset += 4;
        buf.writeUInt16BE(this._minLevel, offset);
        offset += 2;
        buf.writeUInt32BE(this._minResetSlice, offset);
        offset += 4;
        buf.writeUInt32BE(this._maxResetSlice, offset);
        offset += 4;
        buf.writeUInt16BE(this._newbieFlag, offset);
        offset += 2;
        buf.writeUInt16BE(this._driverHelmetFlag, offset);
        offset += 2;
        buf.writeUInt16BE(this._clubMaxNumberPlayers, offset);
        offset += 2;
        buf.writeUInt16BE(this._clubMinNumberPlayers, offset);
        offset += 2;
        buf.writeUInt16BE(this._clubNumberPlayersDefault, offset);
        offset += 2;
        buf.writeUInt16BE(this._minNumberOfClubs, offset);
        offset += 2;
        buf.writeUInt16BE(this._maxNumberOfClubs, offset);
        offset += 2;
        buf.writeUInt32BE(this._racePointsFactor, offset);
        offset += 4;
        buf.writeUInt16BE(this._maxBodyClass, offset);
        offset += 2;
        buf.writeUInt16BE(this._maxPowerClass, offset);
        offset += 2;
        buf.writeUInt16BE(this._partsPrizeMax, offset);
        offset += 2;
        buf.writeUInt16BE(this._partsPrizeWon, offset);
        offset += 2;
        buf.writeUInt32BE(this._clubLogoId, offset);
        offset += 4;
        buf.writeUInt16BE(this._teamTrialsWeatherFlag ? 1 : 0, offset);
        offset += 2;
        buf.writeUInt16BE(this._teamTrialsNightFlag ? 1 : 0, offset);
        offset += 2;
        buf.writeUInt16BE(this._teamTrialsBackwardsFlag ? 1 : 0, offset);
        offset += 2;
        buf.writeUInt16BE(this._teamTrialsNumberLaps, offset);
        offset += 2;
        buf.writeUInt16BE(this._teamTrialsBaseTimeUnderPar, offset);
        offset += 2;
        buf.writeUInt32BE(this._raceCashFactor, offset);
        offset += 4; // 563 total bytes

        return buf;
    }

    toString() {
        return `LobbyInfo {
    lobbyId: ${this._lobbyId},
    raceTypeId: ${this._raceTypeId},
    terfId: ${this._terfId},
    lobbyName: ${this._lobbyName},
    turfName: ${this._turfName},
    clientArt: ${this._clientArt},
    elementId: ${this._elementId},
    turfLengthId: ${this._turfLengthId},
    startSlice: ${this._startSlice},
    endSlice: ${this._endSlice},
    dragStageLeft: ${this._dragStageLeft},
    dragStageRight: ${this._dragStageRight},
    dragStagingSlice: ${this._dragStagingSlice},
    gridSpreadFactor: ${this._gridSpreadFactor},
    linear: ${this._linear},
    minNumberPlayers: ${this._minNumberPlayers},
    maxNumberPlayers: ${this._maxNumberPlayers},
    defaultNumberPlayers: ${this._defaultNumberPlayers},
    numberOfPlayersEnabled: ${this._numberOfPlayersEnabled},
    minLaps: ${this._minLaps},
    maxLaps: ${this._maxLaps},
    defaultNumberOfLaps: ${this._defaultNumberOfLaps},
    numberOfLapsEnabled: ${this._numberOfLapsEnabled},
    minNumberRounds: ${this._minNumberRounds},
    maxNumberRounds: ${this._maxNumberRounds},
    defaultNumberRounds: ${this._defaultNumberRounds},
    numberOfRoundsEnabled: ${this._numberOfRoundsEnabled},
    defaultWeather: ${this._defaultWeather},
    weatherEnabled: ${this._weatherEnabled},
    defaultNight: ${this._defaultNight},
    nightEnabled: ${this._nightEnabled},
    defaultBackwards: ${this._defaultBackwards},
    backwardsEnabled: ${this._backwardsEnabled},
    defaultTraffic: ${this._defaultTraffic},
    trafficEnabled: ${this._trafficEnabled},
    defaultDriverAI: ${this._defaultDriverAI},
    driverAIEnabled: ${this._driverAIEnabled},
    topDog: ${this._topDog},
    turfOwner: ${this._turfOwner},
    qualifyingTime: ${this._qualifyingTime},
    numberOfClubPlayers: ${this._numberOfClubPlayers},
    numberofClubLaps: ${this._numberofClubLaps},
    numberOfClubRounds: ${this._numberOfClubRounds},
    clubNight: ${this._clubNight},
    clubWeather: ${this._clubWeather},
    clubBackwards: ${this._clubBackwards},
    bestLapTime: ${this._bestLapTime},
    lobbyDifficulty: ${this._lobbyDifficulty},
    timetrialPointsToQualify: ${this._timetrialPointsToQualify},
    timetrialCashToQualify: ${this._timetrialCashToQualify},
    timetrialPointsBonusIncrements: ${this._timetrialPointsBonusIncrements},
    timetrialCashBonusIncrements: ${this._timetrialCashBonusIncrements},
    timetrialTimeIncrements: ${this._timetrialTimeIncrements},
    timetrial1stPlaceVictoryPoints: ${this._timetrial1stPlaceVictoryPoints},
    timetrial1stPlaceVictoryCash: ${this._timetrial1stPlaceVictoryCash},
    timetrial2ndPlaceVictoryPoints: ${this._timetrial2ndPlaceVictoryPoints},
    timetrial2ndPlaceVictoryCash: ${this._timetrial2ndPlaceVictoryCash},
    timetrial3rdPlaceVictoryPoints: ${this._timetrial3rdPlaceVictoryPoints},
    timetrial3rdPlaceVictoryCash: ${this._timetrial3rdPlaceVictoryCash},
    minLevel: ${this._minLevel},
    minResetSlice: ${this._minResetSlice},
    maxResetSlice: ${this._maxResetSlice},
    newbieFlag: ${this._newbieFlag},
    driverHelmetFlag: ${this._driverHelmetFlag},
    clubMaxNumberPlayers: ${this._clubMaxNumberPlayers},
    clubMinNumberPlayers: ${this._clubMinNumberPlayers},
    clubNumberPlayersDefault: ${this._clubNumberPlayersDefault},
    minNumberOfClubs: ${this._minNumberOfClubs},
    maxNumberOfClubs: ${this._maxNumberOfClubs},
    racePointsFactor: ${this._racePointsFactor},
    maxBodyClass: ${this._maxBodyClass},
    maxPowerClass: ${this._maxPowerClass},
    partsPrizeMax: ${this._partsPrizeMax},
    partsPrizeWon: ${this._partsPrizeWon},
    clubLogoId: ${this._clubLogoId},
    teamTrialsWeatherFlag: ${this._teamTrialsWeatherFlag},
    teamTrialsNightFlag: ${this._teamTrialsNightFlag},
    teamTrialsBackwardsFlag: ${this._teamTrialsBackwardsFlag},
    teamTrialsNumberLaps: ${this._teamTrialsNumberLaps},
    teamTrialsBaseTimeUnderPar: ${this._teamTrialsBaseTimeUnderPar},
    raceCashFactor: ${this._raceCashFactor},    
}`;
    }
}
