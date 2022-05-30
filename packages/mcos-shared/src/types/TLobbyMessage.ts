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

import { BinaryStructure } from '../structures/BinaryStructure.js'
import { logger } from '../logger/index.js'
import { TSMessageBase } from '../structures/TMessageBase.js'

const log = logger.child({ service: 'mcos:shared:types' })

/**
 *
 *
 * @class
 * @property {number} msgNo
 * @property {number} personaId
 * @property {number} appId
 * @property {number} customerId
 * @property {string} custName
 * @property {string} personaName
 * @property {Buffer} mcVersion
 */

export class TLobbyMessage extends TSMessageBase {

  /**
 * Creates an instance of TLobbyMessage.
 * @memberof TLobbyMessage
 */
  constructor () {
    super()
    log.trace('new TLobbyMessage')
    this._add({ name: 'msgNo', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2) })
    this._add({ name: 'numberOfLobbies', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2) })
    this._add({ name: 'moreMessages?', order: 'little', size: 1, type: 'boolean', value: Buffer.alloc(1) })
    this._add({ name: 'lobbyList', order: 'little', size: 1, type: 'binary', value: Buffer.alloc(1) })
    // 5+ bytes + 11 in super = 16+ bytes
  }

  /**
   * DumpPacket
   * @return {string}
   */
  dumpPacket (): string {
    return `TLobbyMessage',
        ${JSON.stringify(this
      ._fields)}`
  }
}

export class LobbyInfo extends BinaryStructure {
  constructor() {
    super()
    log.trace('new LobbyInfo')
    this._add({name: 'lobbyId', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'raceTypeId', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'terfId', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'lobbyName', order: 'little', size: 32, type: 'char', value: Buffer.alloc(32)})
    this._add({name: 'turfName', order: 'little', size: 256, type: 'char', value: Buffer.alloc(256)})
    this._add({name: 'clientArt', order: 'little', size: 11, type: 'char', value: Buffer.alloc(11)})
    this._add({name: 'elementId', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'turfLengthId', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'startSlice', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'endSlice', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'dragStageLeft', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'dragStaggeRight', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'dragStagingSlice', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'gridSpreadFactor', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'linear', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'minNumberPlayers', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'maxNumberPlayers', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'defaultNumberPlayers', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'numberOfPlayersEnabled', order: 'little', size: 2, type: 'boolean', value: Buffer.alloc(2)})
    this._add({name: 'minLaps', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'maxLaps', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'defaultNumberOfLaps', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'numberOfLapsEnabled', order: 'little', size: 2, type: 'boolean', value: Buffer.alloc(2)})
    this._add({name: 'minNumberRounds', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'maxNumberRounds', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'defaultNumberRounds', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'numberOfRoundsEnabled', order: 'little', size: 2, type: 'boolean', value: Buffer.alloc(2)})
    this._add({name: 'defaultWeather', order: 'little', size: 2, type: 'boolean', value: Buffer.alloc(2)})
    this._add({name: 'weatherEnabled', order: 'little', size: 2, type: 'boolean', value: Buffer.alloc(2)})
    this._add({name: 'defaultNight', order: 'little', size: 2, type: 'boolean', value: Buffer.alloc(2)})
    this._add({name: 'nightEnabled', order: 'little', size: 2, type: 'boolean', value: Buffer.alloc(2)})
    this._add({name: 'defaultBackwards', order: 'little', size: 2, type: 'boolean', value: Buffer.alloc(2)})
    this._add({name: 'backwardsEnabled', order: 'little', size: 2, type: 'boolean', value: Buffer.alloc(2)})
    this._add({name: 'defaultTraffic', order: 'little', size: 2, type: 'boolean', value: Buffer.alloc(2)})
    this._add({name: 'trafficEnabled', order: 'little', size: 2, type: 'boolean', value: Buffer.alloc(2)})
    this._add({name: 'defaultDriverALI', order: 'little', size: 2, type: 'boolean', value: Buffer.alloc(2)})
    this._add({name: 'driverAIEnabled', order: 'little', size: 2, type: 'boolean', value: Buffer.alloc(2)})
    this._add({name: 'topDog', order: 'little', size: 13, type: 'char', value: Buffer.alloc(13)})
    this._add({name: 'turfOwner', order: 'little', size: 33, type: 'char', value: Buffer.alloc(33)})
    this._add({name: 'qualifyingTime', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'numberOfClubPlayers', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'numberofClubLaps', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'numberOfClobRounds', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'clubNight', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'clubWeather', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'clubBackwards', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'bestLapTime', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'lobbyDifficulty', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'timetrialPointsToQualify', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'timetrialCashToQualify', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'timetrialPointsBonusIncrements', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'timetrialCashBonusIncrements', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'timetrialTimeIncrements', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'timetrial1stPlaceVictoryPoints', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'timetrial1stPlaceVictoryCash', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'timetrial2ndPlaceVictoryPoints', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'timetrial2ndPlaceVictoryCash', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'timetrial3rdPlaceVictoryPoints', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'timetrial3rdPlaceVictoryCash', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'minLevel', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'minResetSlice', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'maxResetSlice', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'newbieFlag', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'driverHelmetFlag', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'clubMaxNumberPlayers', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'clubMinNumberPlayers', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'clubNumberPlayersDefault', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'minNumberOfClubs', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'maxNumberOfClubs', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'racePointsFactor', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'maxBodyClass', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'maxPowerClass', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'partsPrizeMax', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'PartsPrizeWon', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'clubLogoId', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
    this._add({name: 'teamTrialsWeatherFlag', order: 'little', size: 2, type: 'boolean', value: Buffer.alloc(2)})
    this._add({name: 'teamTrialsNightFlag', order: 'little', size: 2, type: 'boolean', value: Buffer.alloc(2)})
    this._add({name: 'teamTrialsBackwardsFlag', order: 'little', size: 2, type: 'boolean', value: Buffer.alloc(2)})
    this._add({name: 'teamTrialsNumberLaps', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'teamTrialsBaseTimeUnderPar', order: 'little', size: 2, type: 'u16', value: Buffer.alloc(2)})
    this._add({name: 'raceCashFactor', order: 'little', size: 4, type: 'u32', value: Buffer.alloc(4)})
  }
}
