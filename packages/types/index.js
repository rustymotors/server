/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-check

import { Cipher, Decipher } from 'crypto'
import { Socket } from 'net'
import { Database } from 'sqlite3'

/**
 * @module types
 */

/**
 * @global
 * @readonly
 * @enum {string}
 */
export const EServerConnectionAction = {
  REGISTER_SERVICE: 'Register Service',
}

/**
 * @typedef {object} IEncryptionManager
 * @property {string} id
 * @property {Buffer} sessionkey
 * @property {Decipher | undefined} in
 * @property {Cipher | undefined} out
 * @property {(arg0: Buffer) => Buffer} decrypt
 * @property {(arg0: Buffer) => Buffer} encrypt
 * @property {() => string} getId
 * @property {(sessionkey: Buffer) => boolean} setEncryptionKey
 * @property {() => string} _getSessionKey
 */

/**
 * @global
 * @readonly
 * @enum {string}
 */
export const EServerConnectionName = {
  ADMIN: 'Admin',
  AUTH: 'Auth',
  MCSERVER: 'MCServer',
  PATCH: 'Patch',
  PROXY: 'Proxy',
  SHARD: 'Shard',
}

/**
 * @global
 * @typedef {object} IServerConnection
 * @property {EServerConnectionAction} [action]
 * @property {EServerConnectionName} service
 * @property {string} host
 * @property {number} port
 */

/**
 * @global
 * @readonly
 * @enum {string}
 */
export const ConnectionStatus = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
}

/**
 * @typedef {object} ILobbyCiphers
 * @property { Cipher | null } cipher
 * @property { Decipher | null} decipher
 */

/**
 * @typedef {object} IDatabaseManager
 * @property {Database} localDB
 * @property {number} changes
 * @property {string} serviceName
 * @property {(customerId: number) => Promise<ISessionRecord>} fetchSessionKeyByCustomerId
 * @property {(connectionId: string) => Promise<ISessionRecord>} fetchSessionKeyByConnectionId
 * @property {(customerId: number, sessionkey: string, contextId: string, connectionId: string) => Promise<number>} _updateSessionKey
 */

/**
 * @global
 * @typedef {object} IConnectionManager
 * @property {IDatabaseManager} databaseMgr
 * @property {ITCPConnection[]} connections
 * @property {number} newConnectionId
 * @property {string[]} banList
 * @property {string} serviceName
 * @property {(connectionId: string, socket: Socket) => ITCPConnection} newConnection
 * @property {(rawPacket: IRawPacket) => Promise<ITCPConnection>} processData
 * @property {(opCode: number) => string} getNameFromOpCode
 * @property {(name: string) => number} getOpcodeFromName
 * @property {() => string[]} getBans
 * @property {(remoteAddress: string, localPort: number) => ITCPConnection | undefined} findConnectionByAddressAndPort
 * @property {(connectionId: string) => ITCPConnection} findConnectionById
 * @property {(address: string, port: number, newConnection: ITCPConnection) => Promise<void>} _updateConnectionByAddressAndPort
 * @property {(socket: Socket) => ITCPConnection} findOrNewConnection
 * @property {() => void} resetAllQueueState
 * @property {() => ITCPConnection[]} dumpConnections
 */

/**
 * @typedef {object} IMessageNode
 * @property {(arg0: Buffer) => void} updateBuffer
 * @property {() => Buffer} serialize
 * @property {(arg0: number) => void} setAppId
 * @property {(arg0: Buffer) => void} deserialize
 * @property {(arg0: number) => void} setSeq
 * @property {(arg0: number) => void} setMsgNo
 * @property {(packet: Buffer) => void} setMsgHeader
 * @property {() => boolean} isMCOTS
 * @property {() => void} dumpPacket
 * @property {() => number} getLength
 * @property {number} flags
 * @property {number} appId
 * @property {number} toFrom
 * @property {Buffer} data
 * @property {number} msgNo
 * @property {number} seq
 * @property {EMessageDirection} direction
 * @property {number} dataLength
 * @property {string} mcoSig
 * @property {(packet: Buffer) => void} BaseMsgHeader
 */

/**
 * @global
 * @typedef {object} ITCPConnection
 * @property {(arg0: Buffer)=> void} setEncryptionKey
 * @property {(skey: string) => void} setEncryptionKeyDES
 * @property {(messageBuffer: Buffer) => Buffer} decipherBufferDES
 * @property {string} id
 * @property {number} appId
 * @property {ConnectionStatus} status
 * @property {string | undefined} remoteAddress
 * @property {number} localPort
 * @property {Socket} sock
 * @property {number} msgEvent
 * @property {number} lastMsg
 * @property {boolean} useEncryption
 * @property {ILobbyCiphers} encLobby
 * @property {IEncryptionManager} enc
 * @property {boolean} isSetupComplete
 * @property {IConnectionManager} mgr
 * @property {boolean} inQueue
 * @property {Buffer} decryptedCmd
 * @property {Buffer} encryptedCmd
 * @property {(messageBuffer: Buffer) => Buffer} cipherBufferDES
 */

/**
 * @global
 * @typedef {object} ConnectionWithPacket
 * @property {ITCPConnection} ConnectionWithPacket.connection
 * @property {IMessageNode} ConnectionWithPacket.packet
 */

/**
 * @global
 * @typedef {object} ConnectionWithPackets
 * @property {ITCPConnection} ConnectionWithPackets.connection
 * @property {IMessageNode[]} ConnectionWithPackets.packetList
 */

/**
 * @global
 * @typedef {object} IRawPacket
 * @property {string} connectionId
 * @property {ITCPConnection} connection
 * @property {Buffer} data
 * @property {number} localPort
 * @property {string  | undefined } remoteAddress
 * @property {number} timestamp
 */

/**
 * @global
 * @typedef {"Recieved" | "Sent" } EMessageDirection
 */

/**
 *
 * @global
 * @typedef {object} IServerConfig
 * @property {string} certFilename
 * @property {string} ipServer
 * @property {string} privateKeyFilename
 * @property {string} publicKeyFilename
 * @property {string} connectionURL
 */

/**
 *
 * @global
 * @typedef {object} IAppSettings
 * @property {IServerConfig} serverConfig
 */

/**
 * @global
 * @typedef {object} ISessionRecord
 * @property {string} skey
 * @property {string} sessionkey
 */

/**
 *
 * @global
 * @typedef {object} IPersonaRecord
 * @property {number} customerId
 * @property {Buffer} id
 * @property {Buffer} maxPersonas
 * @property {Buffer} name
 * @property {Buffer} personaCount
 * @property {Buffer} shardId
 */

/**
 * @global
 * @typedef {object} ILobbyInfo
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
 * @typedef {object} ISslOptions
 * @property {string} cert
 * @property {boolean} honorCipherOrder
 * @property {string} key
 * @property {boolean} rejectUnauthorized
 */

/**
 * @global
 * @typedef {object} IUserRecordMini
 * @property {string} contextId
 * @property {number} customerId
 * @property {number} userId
 */

/**
 * @global
 * @typedef {object} InpsCommandMap
 * @property {string} name
 * @property {number} value
 * @property {'Lobby' | 'Login'} module
 */

/**
 * @global
 * @typedef {object} ShardEntry
 * @property {string} name
 * @property {string} description
 * @property {number} id
 * @property {string} loginServerIp
 * @property {number} loginServerPort
 * @property {string} lobbyServerIp
 * @property {number} lobbyServerPort
 * @property {string} mcotsServerIp
 * @property {number} statusId
 * @property {string} statusReason
 * @property {string} serverGroupName
 * @property {number} population
 * @property {number} maxPersonasPerUser
 * @property {string} diagnosticServerHost
 * @property {number} diagnosticServerPort
 */

/**
 * @global
 * @typedef {object} IAppConfiguration
 * @property {object} IAppConfiguration.certificate
 * @property {string} IAppConfiguration.certificate.privateKeyFilename
 * @property {string} IAppConfiguration.certificate.publicKeyFilename
 * @property {string} IAppConfiguration.certificate.certFilename
 * @property {object} IAppConfiguration.serverSettings
 * @property {string} IAppConfiguration.serverSettings.ipServer
 * @property {object} IAppConfiguration.serviceConnections
 * @property {string} IAppConfiguration.serviceConnections.databaseURL
 * @property {string} IAppConfiguration.defaultLogLevel
 */

/**
 * @typedef {Object} config
 * @property {Object} certificate
 * @property {string} certificate.privateKeyFilename
 * @property {string} certificate.publicKeyFilename
 * @property {string} certificate.certFilename
 * @property {Object} serverSettings
 * @property {string} serverSettings.ipServer
 * @property {Object} serviceConnections
 * @property {string} serviceConnections.databaseURL
 * @property {string} defaultLogLevel
 * @global
 */

/**
 *
 * @global
 * @typedef {Object} INPSMessageJSON
 * @property {number} INPSMsgJSON.msgNo
 * @property {number | null} INPSMsgJSON.opCode
 * @property {number} INPSMsgJSON.msgLength
 * @property {number} INPSMsgJSON.msgVersion
 * @property {string} INPSMsgJSON.content
 * @property {string} INPSMsgJSON.contextId
 * @property {EMessageDirection} INPSMsgJSON.direction
 * @property {string | null } INPSMsgJSON.sessionkey
 * @property {string} INPSMsgJSON.rawBuffer
 */
