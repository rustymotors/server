// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import {TCPConnection} from './services/MCServer/tcpConnection';

/**
 * @module SharedTypes
 */

/**
 * @global
 * @typedef {Object} IRawPacket
 * @property {string} connectionId
 * @property {module:ConnectionObj} connection
 * @property {Buffer} data
 * @property {number} localPort
 * @property {string  | undefined } remoteAddress
 * @property {number} timestamp
 */
export interface IRawPacket {
    connectionId: string
    connection: TCPConnection
    data: Buffer
    localPort: number | undefined
    remoteAddress: string | undefined
    timestamp: number
}


/**
 *
 * @global
 * @typedef {Object} IServerConfig
 * @property {string} certFilename
 * @property {string} ipServer
 * @property {string} privateKeyFilename
 * @property {string} publicKeyFilename
 * @property {string} connectionURL
 */

/**
 *
 * @global
 * @typedef {Object} IAppSettings
 * @property {IServerConfig} serverConfig
 */

/**
 * @global
 * @typedef {Object} ISessionRecord
 * @property {string} skey
 * @property {string} sessionkey
 */
export interface ISessionRecord {
    skey: string
    sessionkey: string
}

/**
 * @global
 * @typedef {Object} MCOTS_Session
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

/**
 * @global
 * @typedef {Object} ISslOptions
 * @property {string} cert
 * @property {boolean} honorCipherOrder
 * @property {string} key
 * @property {boolean} rejectUnauthorized
 */
export interface ISslOptions {
    cert: string
    honorCipherOrder: boolean
    key: string
    rejectUnauthorized: boolean
}

/**
 * @global
 * @typedef {Object} IUserRecordMini
 * @property {string} contextId
 * @property {number} customerId
 * @property {number} userId
 */
export interface IUserRecordMini {
    contextId: string
    customerId: number
    userId: number
}

/**
 * @global
 * @typedef {Object} InpsCommandMap
 * @property {string} name
 * @property {number} value
 * @property {'Lobby' | 'Login'} module
 */
