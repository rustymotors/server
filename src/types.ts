// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { ConnectionObj } from './services/MCServer/ConnectionObj'

/**
 * @global
 * @typedef IRawPacket
 * @property {string} connectionId
 * @property {module:ConnectionObj} connection
 * @property {Buffer} data
 * @property {number} localPort
 * @property {string  | undefined } remoteAddress
 * @property {number} timestamp
 */
export interface IRawPacket {
  connectionId: string
  connection: ConnectionObj
  data: Buffer
  localPort: number
  remoteAddress: string | undefined
  timestamp: number
}

/**
 *
 * @global
 * @typedef IServerConfig
 * @property {string} certFilename
 * @property {string} ipServer
 * @property {string} privateKeyFilename
 * @property {string} publicKeyFilename
 * @property {string} connectionURL
 */
export interface IServerConfig {
  certFilename: string
  ipServer: string
  privateKeyFilename: string
  publicKeyFilename: string
  connectionURL: string
}

/**
 *
 * @global
 * @typedef IAppSettings
 * @property {IServerConfig} serverConfig
 */
export interface IAppSettings {
  serverConfig: IServerConfig
}

/**
 * @global
 * @typedef ISessionRecord
 * @property {string} s_key
 * @property {string} session_key
 */
export interface ISessionRecord {
  sKey: string
  sessionKey: string
}

/**
  * @global
  * @typedef MCOTS_Session
  * @property {module:ConnectionObj} con
  * @property {module:MessageNode[]} nodes
  */

/**
 *
 * @global
 * @typedef {Object} IPersonaRecord
 * @property {number} customerId
 * @property {Buffer} id
 * @property {Buffer} maxPersonas
 * @property {Buffer} name
 * @property {Buffer} personaCount
 * @property {Buffer} shardId
 */
export interface IPersonaRecord {
  customerId: number
  id: Buffer
  maxPersonas: Buffer
  name: Buffer
  personaCount: Buffer
  shardId: Buffer
}

/**
 * @global
 * @typedef {Object} ILobbyInfo
 * @property {number} lobbyId
 * @property {number} racetypeId
 * @property {number} turfId
 * @property {string} NPSRiffName
 * @property {string} eTurfName
 * @property {string} clientArt
 * @property {number} elementId
 * @property {number} turfLength
 * @property {number} startSlice
 * @property {number} endSlice
 * @property {number} dragStageLeft
 * @property {number} dragStageRight
 * @property {number} dragStagingSlice
 * @property {number} gridSpreadFactor
 * @property {number} linear
 * @property {number} numplayersmin
 * @property {number} numplayersdefault
 * @property {number} bnumplayersenabled
 * @property {number} numlapsmin
 * @property {number} numlapsmax
 * @property {number} numplayersmax
 * @property {number} numlapsdefault
 * @property {number} bnumlapsenabled
 * @property {number} numroundsmin
 * @property {number} numroundsmax
 * @property {number} numroundsdefault
 * @property {number} bnumroundsenabled
 * @property {number} bweatherdefault
 * @property {number} bweatherenabled
 * @property {number} bnightdefault
 * @property {number} bnightenabled
 * @property {number} bbackwarddefault
 * @property {number} bbackwardenabled
 * @property {number} btrafficdefault
 * @property {number} btrafficenabled
 * @property {number} bdamagedefault
 * @property {number} bdamageenabled
 * @property {number} baidefault
 * @property {number} baienabled
 * @property {string} topDog
 * @property {string} turfOwner
 * @property {number} qualifyingTime
 * @property {number} clubNumPlayers
 * @property {number} clubNumLaps
 * @property {number} clubNumRounds
 * @property {number} clubNight
 * @property {number} clubWeather
 * @property {number} clubBackwards
 * @property {number} bestLapTime
 * @property {number} lobbyDifficulty
 * @property {number} ttPointForQualify
 * @property {number} ttCashForQualify
 * @property {number} ttPointBonusFasterIncs
 * @property {number} ttCashBonusFasterIncs
 * @property {number} ttTimeIncrements
 * @property {number} ttvictory_1st_points
 * @property {number} ttvictory_1st_cash
 * @property {number} ttvictory_2nd_points
 * @property {number} ttvictory_2nd_cash
 * @property {number} ttvictory_3rd_points
 * @property {number} ttvictory_3rd_cash
 * @property {number} minLevel
 * @property {number} minResetSlice
 * @property {number} maxResetSlice
 * @property {number} newbieFlag
 * @property {number} driverHelmetFlag
 * @property {number} clubNumPlayersMin
 * @property {number} clubNumPlayersMax
 * @property {number} clubNumPlayersDefault
 * @property {number} numClubsMin
 * @property {number} racePointsFactor
 * @property {number} bodyClassMax
 * @property {number} powerClassMax
 * @property {number} partPrizesMax
 * @property {number} partPrizesWon
 * @property {number} clubLogoId
 * @property {number} bteamtrialweather
 * @property {number} bteamtrialnight
 * @property {number} bteamtrialbackward
 * @property {number} teamtrialnumlaps
 * @property {number} teamtrialbaseTUP
 * @property {number} raceCashFactor
 */
export interface ILobbyInfo {
  lobbyId: number
  racetypeId: number
  turfId: number
  NPSRiffName: string
  eTurfName: string
  clientArt: string
  elementId: number
  turfLength: number
  startSlice: number
  endSlice: number
  dragStageLeft: number
  dragStageRight: number
  dragStagingSlice: number
  gridSpreadFactor: number
  linear: number
  numplayersmin: number
  numplayersdefault: number
  bnumplayersenabled: number
  numlapsmin: number
  numlapsmax: number
  numplayersmax: number
  numlapsdefault: number
  bnumlapsenabled: number
  numroundsmin: number
  numroundsmax: number
  numroundsdefault: number
  bnumroundsenabled: number
  bweatherdefault: number
  bweatherenabled: number
  bnightdefault: number
  bnightenabled: number
  bbackwarddefault: number
  bbackwardenabled: number
  btrafficdefault: number
  btrafficenabled: number
  bdamagedefault: number
  bdamageenabled: number
  baidefault: number
  baienabled: number
  topDog: string
  turfOwner: string
  qualifyingTime: number
  clubNumPlayers: number
  clubNumLaps: number
  clubNumRounds: number
  clubNight: number
  clubWeather: number
  clubBackwards: number
  bestLapTime: number
  lobbyDifficulty: number
  ttPointForQualify: number
  ttCashForQualify: number
  ttPointBonusFasterIncs: number
  ttCashBonusFasterIncs: number
  ttTimeIncrements: number
  // eslint-disable-next-line camelcase
  ttvictory_1st_points: number
  // eslint-disable-next-line camelcase
  ttvictory_1st_cash: number
  // eslint-disable-next-line camelcase
  ttvictory_2nd_points: number
  // eslint-disable-next-line camelcase
  ttvictory_2nd_cash: number
  // eslint-disable-next-line camelcase
  ttvictory_3rd_points: number
  // eslint-disable-next-line camelcase
  ttvictory_3rd_cash: number
  minLevel: number
  minResetSlice: number
  maxResetSlice: number
  newbieFlag: number
  driverHelmetFlag: number
  clubNumPlayersMin: number
  clubNumPlayersMax: number
  clubNumPlayersDefault: number
  numClubsMin: number
  racePointsFactor: number
  bodyClassMax: number
  powerClassMax: number
  partPrizesMax: number
  partPrizesWon: number
  clubLogoId: number
  bteamtrialweather: number
  bteamtrialnight: number
  bteamtrialbackward: number
  teamtrialnumlaps: number
  teamtrialbaseTUP: number
  raceCashFactor: number
}
