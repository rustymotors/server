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

/**
 *
 * @global
 * @typedef IAppSettings
 * @property {IServerConfig} serverConfig
 */

/**
 * @global
 * @typedef Session_Record
 * @property {string} s_key
 * @property {string} session_key
 */

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
