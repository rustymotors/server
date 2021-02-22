// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { npsCommandMap, NPS_COMMAND_MODULE } from './types'

// eslint-disable-next-line camelcase
export const _NPS_RiffListHeader = {
  StructSize: Buffer.alloc(4), // Uint4B
  NumRiffs: Buffer.alloc(4) // UInt4B
}

// eslint-disable-next-line camelcase
export const _NPS_RiffInfo = {
  Riff: Buffer.alloc(32), // [32] Char
  Protocol: Buffer.alloc(4), // Uint4B
  CommId: Buffer.alloc(4), // Int4B
  Password: Buffer.alloc(17), // [17] Char
  ChannelType: Buffer.alloc(4), // Int4B
  ConnectedUsers: Buffer.alloc(4), // Int4B
  OpenChannels: Buffer.alloc(4), // Int4B
  UserIsConnected: Buffer.alloc(4), // Int4B
  ChannelData: Buffer.alloc(256), // [256] Char
  NumberOfReadyPlayers: Buffer.alloc(4), // Uint4B
  MaxReadyPlayers: Buffer.alloc(4), // Uint4B
  MasterUserId: Buffer.alloc(4), // Uint4B
  GameServerISRunning: Buffer.alloc(1) // Char
}

export const LobbyMsg = {
  msgNo: Buffer.alloc(4), // Uint4B
  noLobbies: Buffer.alloc(4), // Uint4B
  moreToCome: Buffer.alloc(4), // Uint4B
  lobbyInfo: Buffer.alloc(142) // [142] LobbyInfo
}

export const LobbyInfo = {
  lobbyID: Buffer.alloc(4), // Uint4B
  raceTypeID: Buffer.alloc(4), // Uint4B
  turfID: Buffer.alloc(4), // Uint4B
  NPSRiffName: Buffer.alloc(32), // [32] Char
  eTurfName: Buffer.alloc(256), // [256] Char
  clientArt: Buffer.alloc(11), // [11] Char
  elementID: Buffer.alloc(4), // Uint4B
  turfLength: Buffer.alloc(4), // Uint4B
  startSlice: Buffer.alloc(4), // Uint4B
  endSlice: Buffer.alloc(4), // Uint4B
  dragStageLeft: Buffer.alloc(4), // Float (4B)
  dragStageRight: Buffer.alloc(4), // Float (4B)
  dragStagingSlice: Buffer.alloc(4), // Uint4B
  gridSpreadFactor: Buffer.alloc(4), // Float (4B)
  linear: Buffer.alloc(4), // Uint4B
  numplayersmin: Buffer.alloc(4), // Uint4B
  numplayersmax: Buffer.alloc(4), // Uint4B
  numplayersdefault: Buffer.alloc(4), // Uint4B
  bnumplayersenabled: Buffer.alloc(4), // Uint4B
  numlapsmin: Buffer.alloc(4), // Uint4B
  numlapsmax: Buffer.alloc(4), // Uint4
  numlapsdefault: Buffer.alloc(4), // Uint4B
  bnumlapsenabled: Buffer.alloc(4), // Uint4B
  numroundsmin: Buffer.alloc(4), // Uint4B
  numroundsmax: Buffer.alloc(4), // Uint4B
  numroundsdefault: Buffer.alloc(4), // Uint4B
  bnumroundsenabled: Buffer.alloc(4), // Uint4B
  bweatherdefault: Buffer.alloc(4), // Uint4B
  bweatherenabled: Buffer.alloc(4), // Uint4B
  bnightdefault: Buffer.alloc(4), // Uint4B
  bnightenabled: Buffer.alloc(4), // Uint4
  bbackwardsdefault: Buffer.alloc(4), // Uint4
  bbackwardsenabled: Buffer.alloc(4), // Uint4B
  btrafficdefault: Buffer.alloc(4), // Uint4B
  btrafficenabled: Buffer.alloc(4), // Uint4B
  bdamagedefault: Buffer.alloc(4), // Uint4B
  bdamageenabled: Buffer.alloc(4), // Uint4B
  baidefault: Buffer.alloc(4), // Uint4B
  baienabled: Buffer.alloc(4), // Uint4B
  topDog: Buffer.alloc(13), // [13] Char
  turfOwner: Buffer.alloc(33), // [33] Char
  qualifyingTime: Buffer.alloc(4), // Uint4B
  clubNumPlayers: Buffer.alloc(4), // Uint4B
  clubNumLaps: Buffer.alloc(4), // Uint4B
  blubNumRounds: Buffer.alloc(4), // Uint4B
  clubNight: Buffer.alloc(4), // Uint4B
  clubWeather: Buffer.alloc(4), // Uint4B
  clubBackwards: Buffer.alloc(4), // Uint4B
  bestLapTime: Buffer.alloc(4), // Uint4B
  lobbyDifficulty: Buffer.alloc(4), // Uint4B
  ttPointForQualify: Buffer.alloc(4), // Uint4B
  ttCashForQualify: Buffer.alloc(4), // Uint4B
  ttPointBonusFasterIncs: Buffer.alloc(4), // Uint4B
  ttCashBonusFasterIncs: Buffer.alloc(4), // Uint4B
  ttTimeIncrements: Buffer.alloc(4), // Uint3B
  ttvictory_1st_points: Buffer.alloc(4), // Uint4B
  ttvictory_1st_cash: Buffer.alloc(4), // Uint4B
  ttvictory_2nd_points: Buffer.alloc(4), // Uint4B
  ttvictory_2nd_cash: Buffer.alloc(4), // Uint4B
  ttvictory_3rd_points: Buffer.alloc(4), // Uint4B
  ttvictory_3rd_cash: Buffer.alloc(4), // Uint4B
  minLevel: Buffer.alloc(4), // Uint4B
  minResetSlice: Buffer.alloc(4), // Uint4B
  maxResetSlice: Buffer.alloc(4), // Uint4B
  newbieFlag: Buffer.alloc(4), // Uint4B
  driverHelmetFlag: Buffer.alloc(4), // Uint4B
  clubNumPlayersMax: Buffer.alloc(4), // Uint4B
  clubNumPlayersMin: Buffer.alloc(4), // Uint4B
  clubNumPlayersDefault: Buffer.alloc(4), // Uint4B
  numClubsMax: Buffer.alloc(4), // Uint4B
  numClubsMin: Buffer.alloc(4), // Uint4B
  racePointsFactor: Buffer.alloc(4), // Float (4B)
  bodyClassMax: Buffer.alloc(4), // Uint4B
  powerClassMax: Buffer.alloc(4), // Uint4B
  partPrizesMax: Buffer.alloc(4), // Uint4B
  partPrizesWon: Buffer.alloc(4), // Uint4B
  clubLogoID: Buffer.alloc(4), // Uint4B
  bteamtrialweather: Buffer.alloc(4), // Uint4B
  bteamtrialnight: Buffer.alloc(4), // Uint4B
  bteamtrialbackwards: Buffer.alloc(4), // Uint4B
  teamtrialnumlaps: Buffer.alloc(4), // Uint4B
  teamtrialbaseTUP: Buffer.alloc(4), // Uint4B
  raceCashFactor: Buffer.alloc(4) // Float (4B)
}

// eslint-disable-next-line camelcase
export const GLDP_Persona = {
  customerId_: Buffer.alloc(4), // Uint4B
  personaId_: Buffer.alloc(4), // Uint4B
  creationDate_: Buffer.alloc(4), // Int4B
  personaName_: Buffer.alloc(33) // [33] Char
}

export const _UserGameData = {
  CustomerId: Buffer.alloc(4), // Uint4B
  GameUserName: Buffer.alloc(33), // [33] Char
  ServerDataId: Buffer.alloc(4), // Uint4B
  CreateDate: Buffer.alloc(4), // Int4B
  LastLogin: Buffer.alloc(4), // Int4B
  NumGames: Buffer.alloc(4), // Int4B
  GameUserId: Buffer.alloc(4), // Uint4B
  IsOnSystem: Buffer.alloc(4), // Int4B
  GamePurchaseDate: Buffer.alloc(4), // Int4B
  GameSerialNumber: Buffer.alloc(33), // [33] Char
  TimeOnline: Buffer.alloc(4), // Int4B
  TimeInGame: Buffer.alloc(4), // Int4B
  GameSpecific: Buffer.alloc(512), // [512] Char
  PersonalBlob: Buffer.alloc(256), // [256] Char
  PictureBlob: Buffer.alloc(1), // [1] Char
  DND: Buffer.alloc(4), // Int4B
  GameStart: Buffer.alloc(4), // Int4B
  CurrentKey: Buffer.alloc(400), // [400] Char
  PersonaLevle: Buffer.alloc(4), // Int4B
  ShardId: Buffer.alloc(4) // Uint4B
}

// eslint-disable-next-line camelcase
export const GLDP_PersonaList = {
  NPS_SerializeList: Buffer.alloc(48), // NPS_SerializeList
  maxPersonas_: Buffer.alloc(4)// Uint4B
}

export const GenericReply = {
  msgNo: Buffer.alloc(4), // Uint4B
  msgReply: Buffer.alloc(4), // Uint4B
  result: Buffer.alloc(4), // Uint4B
  data: Buffer.alloc(4), // Uint4B
  data2: Buffer.alloc(4) // Uint4B
}

// eslint-disable-next-line camelcase
export const NPS_GetPersonaMapListReq = {
  NPS_SerializeList: Buffer.alloc(48), // NPS_SerializeList
  customerId_: Buffer.alloc(4) // Uint4B
}

export const BaseMsgHeader = {
  msgNo: Buffer.alloc(4) // Uint4B
}

export const CompressedHeader = {
  uncompressedLength: Buffer.alloc(4), // Uint4B
  data: Buffer.alloc(0) // [0] Uint4B
}

export const MessageNode = {
  toFrom: Buffer.alloc(4), // UInt4B
  appID: Buffer.alloc(4), // UInt4B
  header: Buffer.alloc(8), // msgHead
  seq: Buffer.alloc(4), // UInt4B
  flags: Buffer.alloc(4), // UInt4B
  buffer: Buffer.alloc(1) // [1] Char
}

/**
 * Commands from the game server to the game client
 */
export const NPS_LOBBYSERVER_COMMANDS: npsCommandMap[] = [
  { name: 'NPS_FORCE_LOGOFF', value: 513, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_USER_LEFT', value: 514, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_USER_JOINED', value: 515, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_USER_INFO', value: 516, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SYSTEM_ALERT', value: 517, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_CLIENT_COUNT', value: 518, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_ACK', value: 519, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_USER_LEFT_CHANNEL', value: 520, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_CHANNEL_CLOSED', value: 521, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_DUP_USER', value: 522, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SERVER_FULL', value: 523, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_USER_JOINED_CHANNEL', value: 524, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SERVER_INFO', value: 525, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_CHANNEL_CREATED', value: 526, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_CHANNEL_DELETED', value: 527, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_READY_LIST', value: 528, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_USER_LIST', value: 529, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SERVER_LIST', value: 530, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_CHANNEL_DENIED', value: 531, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_CHANNEL_GRANTED', value: 532, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_CHANNEL_CONDITIONAL', value: 533, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SERVER_REDIRECT', value: 534, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_HEARTBEAT', value: 535, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_HEARTBEAT_TIMEOUT', value: 536, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_CHANNEL_UPDATE', value: 537, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_FORCE_LEAVE_CHANNEL', value: 538, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_USER_LOCATION', value: 539, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_GAME_SERVER_STARTED', value: 540, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_GAME_SERVER_TERMINATED', value: 541, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_VERSIONS_DIFFERENT', value: 542, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SEND_VERSION_STRING', value: 543, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_GAME_SKU_REGISTRY_KEY', value: 544, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_PLUGIN_ACK', value: 545, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SERVER_CRASHED', value: 546, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_OPEN_COMM_CHANNEL_ACK', value: 547, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_GAME_SERVER_STATE_CHANGE', value: 548, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SLOT_UPDATE', value: 549, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SLOT_LIST', value: 550, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_CHANNEL_MASTER', value: 551, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_CHANNEL_MASTER_LIST', value: 552, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_MINI_USER_LIST', value: 553, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_INVALID_KEY', value: 554, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_NO_VALIDATION_SERVER', value: 555, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_INC_MINI_USER_LIST', value: 556, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_DEC_MINI_USER_LIST', value: 557, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_BUDDY_LIST', value: 558, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_BUDDYLIST_UPDATE', value: 559, module: NPS_COMMAND_MODULE.Lobby }
]

/**
 * Commands from the game client to the game server
 */
export const NPS_LOBBYCLIENT_COMMANDS: npsCommandMap[] = [
  { name: 'NPS_LOGIN', value: 256, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_GET_USER_LIST', value: 257, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_GET_MY_USER_DATA', value: 258, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SET_MY_USER_DATA', value: 259, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_LOG_OFF_SERVER', value: 260, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_CLOSE_COMM_CHANNEL', value: 261, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_OPEN_COMM_CHANNEL', value: 262, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_GET_CLIENT_COUNT', value: 263, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_START_GAME', value: 264, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_READY_FOR_GAME', value: 265, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_START_GAME_SERVER', value: 266, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SET_SLEEP_STATE', value: 267, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_GET_SERVER_INFO', value: 268, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SET_COMM_FLAGS', value: 269, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_GET_READY_LIST', value: 270, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SEND_SERVER_LIST', value: 271, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SET_COMM_CHANNEL_RATE', value: 272, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SET_HEARTBEAT_TIMEOUT', value: 273, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_GET_HEARTBEAT_TIMEOUT', value: 274, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SET_CHANNEL_DATA', value: 275, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_FILE_START', value: 276, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_FILE_DATA', value: 277, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_FILE_COMPLETED', value: 278, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_BOOT_USER_FROM_CHANNEL', value: 279, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_LOCATE_USER', value: 280, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_ENABLE_FILTER', value: 281, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_DISABLE_FILTER', value: 282, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SLEEP_SERVER', value: 283, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_WAKE_SERVER', value: 284, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_TERMINATE_GAME_SERVER', value: 285, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SEND_SKU_REGISTRY', value: 286, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SET_READY_FOR_GAME', value: 287, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_LOGIN_RESP', value: 288, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SOCKET_RECONNECT', value: 289, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SET_SLOT', value: 290, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_GET_SLOT_LIST', value: 291, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_SET_CHANNEL_CLOSED', value: 292, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_UDP_STATUS', value: 293, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_GET_USER_INFO', value: 294, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_GET_MASTER_LIST', value: 295, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_GET_MINI_USER_LIST', value: 296, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_UDP_FAILURE', value: 297, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_BUDDYLIST_REFRESH', value: 298, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_BUDDYLIST_ADD_USERS', value: 299, module: NPS_COMMAND_MODULE.Lobby },
  { name: 'NPS_BUDDYLIST_REMOVE_USERS', value: 300, module: NPS_COMMAND_MODULE.Lobby }
]

/**
 * Commands from the game client to the login server
 */
export const NPS_LOGINCLIENT_COMMANDS: npsCommandMap[] = [
  { name: 'NPS_USER_LOGIN', value: 1281, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_GAME_LOGIN', value: 1282, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_REGISTER_GAME_LOGIN', value: 1283, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_SET_GAME_BLOB', value: 1284, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_GET_NEXT_SERVER', value: 1285, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_NEW_EA_ACCOUNT', value: 1286, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_NEW_GAME_ACCOUNT', value: 1287, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_UPDATE_EA_ACCOUNT', value: 1288, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_UPDATE_GAME_ACCOUNT', value: 1289, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_LOCATE_PLAYER', value: 1290, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_GET_BUDDY_LIST', value: 1291, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_ADD_BUDDY_LIST', value: 1292, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_DELETE_BUDDY_LIST', value: 1293, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_CLEAR_BUDDY_LIST', value: 1294, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_REGISTER_GAME_LOGOUT', value: 1295, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_GET_GENERIC_HS_DATA', value: 1296, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_PUT_GENERIC_HS_DATA', value: 1297, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_DELETE_GAME_PERSONA', value: 1298, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_READ_SERVER_DATA_LIST', value: 1299, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_DELETE GENERIC_HS_DATA', value: 1300, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_GET_PLAYER_RANK', value: 1301, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_GET_TOP_PLAYERS', value: 1302, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_ADD_BUDDY_BY_NAME', value: 1303, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_GET_BUDDY_INFO', value: 1304, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_GET_PERSONA_INFO', value: 1305, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_GET_LEADER_BOARD', value: 1306, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_SRP_USERNAME', value: 1307, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_SRP_NGS', value: 1308, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_SRP_A', value: 1309, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_SRP_B', value: 1310, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_SRP_USER_VERIFY', value: 1311, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_SRP_SERVER_VERIFY', value: 1312, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_FILE_BUG_REPORT', value: 1313, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_GET_GENERIC_FIELD_RANKING', value: 1314, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_SEND_EMAIL', value: 1315, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_RECEIVE_EMAIL', value: 1316, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_DELETE_EMAILS', value: 1317, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_LIST_EMAILS', value: 1318, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_AAI_REQUEST', value: 1328, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_AAI_CRACK', value: 1329, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_GET_PERSONA_MAPS', value: 1330, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_VALIDATE_PERSONA_NAME', value: 1331, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_CHECK_TOKEN', value: 1332, module: NPS_COMMAND_MODULE.Login },
  { name: 'NPS_GET_USER_STATUS', value: 1333, module: NPS_COMMAND_MODULE.Login }
]

export const NPS_LOBBY_COMMANDS: npsCommandMap[] = [
  ...NPS_LOBBYCLIENT_COMMANDS, ...NPS_LOBBYSERVER_COMMANDS
]

export const NPS_LOGIN_COMMANDS: npsCommandMap[] = [
  ...NPS_LOGINCLIENT_COMMANDS
]

export const NPS_COMMANDS:npsCommandMap[] = [
  ...NPS_LOBBY_COMMANDS, ...NPS_LOGINCLIENT_COMMANDS,
  { name: 'NPS_CRYPTO_DES_CBC', value: 0x1101, module: NPS_COMMAND_MODULE.Lobby }
]
