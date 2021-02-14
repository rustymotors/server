/* eslint-disable */

const _NPS_RiffListHeader = {
  StructSize: Buffer.alloc(4), // Uint4B
  NumRiffs: Buffer.alloc(4) // UInt4B
}

const _NPS_RiffInfo = {
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

const LobbyMsg = {
  msgNo: Buffer.alloc(4), // Uint4B
  noLobbies: Buffer.alloc(4), // Uint4B
  moreToCome: Buffer.alloc(4), // Uint4B
  lobbyInfo: Buffer.alloc(142) // [142] LobbyInfo
}

const LobbyInfo = {
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