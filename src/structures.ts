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
export const NPS_LOBBYSERVER_COMMANDS = [
  { name: 'NPS_FORCE_LOGOFF', value: 513, module: 'Lobby' },
  { name: 'NPS_USER_LEFT', value: 514, module: 'Lobby' },
  { name: 'NPS_USER_JOINED', value: 515, module: 'Lobby' },
  { name: 'NPS_USER_INFO', value: 516, module: 'Lobby' },
  { name: 'NPS_SYSTEM_ALERT', value: 517, module: 'Lobby' },
  { name: 'NPS_CLIENT_COUNT', value: 518, module: 'Lobby' },
  { name: 'NPS_ACK', value: 519, module: 'Lobby' },
  { name: 'NPS_USER_LEFT_CHANNEL', value: 520, module: 'Lobby' },
  { name: 'NPS_CHANNEL_CLOSED', value: 521, module: 'Lobby' },
  { name: 'NPS_DUP_USER', value: 522, module: 'Lobby' },
  { name: 'NPS_SERVER_FULL', value: 523, module: 'Lobby' },
  { name: 'NPS_USER_JOINED_CHANNEL', value: 524, module: 'Lobby' },
  { name: 'NPS_SERVER_INFO', value: 525, module: 'Lobby' },
  { name: 'NPS_CHANNEL_CREATED', value: 526, module: 'Lobby' },
  { name: 'NPS_CHANNEL_DELETED', value: 527, module: 'Lobby' },
  { name: 'NPS_READY_LIST', value: 528, module: 'Lobby' },
  { name: 'NPS_USER_LIST', value: 529, module: 'Lobby' },
  { name: 'NPS_SERVER_LIST', value: 530, module: 'Lobby' },
  { name: 'NPS_CHANNEL_DENIED', value: 531, module: 'Lobby' },
  { name: 'NPS_CHANNEL_GRANTED', value: 532, module: 'Lobby' },
  { name: 'NPS_CHANNEL_CONDITIONAL', value: 533, module: 'Lobby' },
  { name: 'NPS_SERVER_REDIRECT', value: 534, module: 'Lobby' },
  { name: 'NPS_HEARTBEAT', value: 535, module: 'Lobby' },
  { name: 'NPS_HEARTBEAT_TIMEOUT', value: 536, module: 'Lobby' },
  { name: 'NPS_CHANNEL_UPDATE', value: 537, module: 'Lobby' },
  { name: 'NPS_FORCE_LEAVE_CHANNEL', value: 538, module: 'Lobby' },
  { name: 'NPS_USER_LOCATION', value: 539, module: 'Lobby' },
  { name: 'NPS_GAME_SERVER_STARTED', value: 540, module: 'Lobby' },
  { name: 'NPS_GAME_SERVER_TERMINATED', value: 541, module: 'Lobby' },
  { name: 'NPS_VERSIONS_DIFFERENT', value: 542, module: 'Lobby' },
  { name: 'NPS_SEND_VERSION_STRING', value: 543, module: 'Lobby' },
  { name: 'NPS_GAME_SKU_REGISTRY_KEY', value: 544, module: 'Lobby' },
  { name: 'NPS_PLUGIN_ACK', value: 545, module: 'Lobby' },
  { name: 'NPS_SERVER_CRASHED', value: 546, module: 'Lobby' },
  { name: 'NPS_OPEN_COMM_CHANNEL_ACK', value: 547, module: 'Lobby' },
  { name: 'NPS_GAME_SERVER_STATE_CHANGE', value: 548, module: 'Lobby' },
  { name: 'NPS_SLOT_UPDATE', value: 549, module: 'Lobby' },
  { name: 'NPS_SLOT_LIST', value: 550, module: 'Lobby' },
  { name: 'NPS_CHANNEL_MASTER', value: 551, module: 'Lobby' },
  { name: 'NPS_CHANNEL_MASTER_LIST', value: 552, module: 'Lobby' },
  { name: 'NPS_MINI_USER_LIST', value: 553, module: 'Lobby' },
  { name: 'NPS_INVALID_KEY', value: 554, module: 'Lobby' },
  { name: 'NPS_NO_VALIDATION_SERVER', value: 555, module: 'Lobby' },
  { name: 'NPS_INC_MINI_USER_LIST', value: 556, module: 'Lobby' },
  { name: 'NPS_DEC_MINI_USER_LIST', value: 557, module: 'Lobby' },
  { name: 'NPS_BUDDY_LIST', value: 558, module: 'Lobby' },
  { name: 'NPS_BUDDYLIST_UPDATE', value: 559, module: 'Lobby' }
]
