/// <reference types="node" />
import { InpsCommandMap } from './types'
export declare const _NPS_RiffListHeader: {
  StructSize: Buffer
  NumRiffs: Buffer
}
export declare const _NPS_RiffInfo: {
  Riff: Buffer
  Protocol: Buffer
  CommId: Buffer
  Password: Buffer
  ChannelType: Buffer
  ConnectedUsers: Buffer
  OpenChannels: Buffer
  UserIsConnected: Buffer
  ChannelData: Buffer
  NumberOfReadyPlayers: Buffer
  MaxReadyPlayers: Buffer
  MasterUserId: Buffer
  GameServerISRunning: Buffer
}
export declare const LobbyMessage: {
  msgNo: Buffer
  noLobbies: Buffer
  moreToCome: Buffer
  lobbyInfo: Buffer
}
export declare const LobbyInfo: {
  lobbyID: Buffer
  raceTypeID: Buffer
  turfID: Buffer
  NPSRiffName: Buffer
  eTurfName: Buffer
  clientArt: Buffer
  elementID: Buffer
  turfLength: Buffer
  startSlice: Buffer
  endSlice: Buffer
  dragStageLeft: Buffer
  dragStageRight: Buffer
  dragStagingSlice: Buffer
  gridSpreadFactor: Buffer
  linear: Buffer
  numplayersmin: Buffer
  numplayersmax: Buffer
  numplayersdefault: Buffer
  bnumplayersenabled: Buffer
  numlapsmin: Buffer
  numlapsmax: Buffer
  numlapsdefault: Buffer
  bnumlapsenabled: Buffer
  numroundsmin: Buffer
  numroundsmax: Buffer
  numroundsdefault: Buffer
  bnumroundsenabled: Buffer
  bweatherdefault: Buffer
  bweatherenabled: Buffer
  bnightdefault: Buffer
  bnightenabled: Buffer
  bbackwardsdefault: Buffer
  bbackwardsenabled: Buffer
  btrafficdefault: Buffer
  btrafficenabled: Buffer
  bdamagedefault: Buffer
  bdamageenabled: Buffer
  baidefault: Buffer
  baienabled: Buffer
  topDog: Buffer
  turfOwner: Buffer
  qualifyingTime: Buffer
  clubNumPlayers: Buffer
  clubNumLaps: Buffer
  blubNumRounds: Buffer
  clubNight: Buffer
  clubWeather: Buffer
  clubBackwards: Buffer
  bestLapTime: Buffer
  lobbyDifficulty: Buffer
  ttPointForQualify: Buffer
  ttCashForQualify: Buffer
  ttPointBonusFasterIncs: Buffer
  ttCashBonusFasterIncs: Buffer
  ttTimeIncrements: Buffer
  ttvictory_1st_points: Buffer
  ttvictory_1st_cash: Buffer
  ttvictory_2nd_points: Buffer
  ttvictory_2nd_cash: Buffer
  ttvictory_3rd_points: Buffer
  ttvictory_3rd_cash: Buffer
  minLevel: Buffer
  minResetSlice: Buffer
  maxResetSlice: Buffer
  newbieFlag: Buffer
  driverHelmetFlag: Buffer
  clubNumPlayersMax: Buffer
  clubNumPlayersMin: Buffer
  clubNumPlayersDefault: Buffer
  numClubsMax: Buffer
  numClubsMin: Buffer
  racePointsFactor: Buffer
  bodyClassMax: Buffer
  powerClassMax: Buffer
  partPrizesMax: Buffer
  partPrizesWon: Buffer
  clubLogoID: Buffer
  bteamtrialweather: Buffer
  bteamtrialnight: Buffer
  bteamtrialbackwards: Buffer
  teamtrialnumlaps: Buffer
  teamtrialbaseTUP: Buffer
  raceCashFactor: Buffer
}
export declare const GLDP_Persona: {
  customerId_: Buffer
  personaId_: Buffer
  creationDate_: Buffer
  personaName_: Buffer
}
export declare const _UserGameData: {
  CustomerId: Buffer
  GameUserName: Buffer
  ServerDataId: Buffer
  CreateDate: Buffer
  LastLogin: Buffer
  NumGames: Buffer
  GameUserId: Buffer
  IsOnSystem: Buffer
  GamePurchaseDate: Buffer
  GameSerialNumber: Buffer
  TimeOnline: Buffer
  TimeInGame: Buffer
  GameSpecific: Buffer
  PersonalBlob: Buffer
  PictureBlob: Buffer
  DND: Buffer
  GameStart: Buffer
  CurrentKey: Buffer
  PersonaLevle: Buffer
  ShardId: Buffer
}
export declare const GLDP_PersonaList: {
  NPS_SerializeList: Buffer
  maxPersonas_: Buffer
}
export declare const GenericReply: {
  msgNo: Buffer
  msgReply: Buffer
  result: Buffer
  data: Buffer
  data2: Buffer
}
export declare const NPS_GetPersonaMapListRequest: {
  NPS_SerializeList: Buffer
  customerId_: Buffer
}
/**
 * @property {Buffer} _length
 * @property {Buffer} _mcosig
 */
export declare class MessageHead {
  _length: Buffer
  _mcosig: Buffer
  /**
   *
   */
  constructor()
  /**
   * @return {number}
   */
  get length(): number
  /**
   * @param {number} value
   */
  set length(value: number)
  /**
   * @return {Buffer}
   */
  get mcosig(): Buffer
  /**
   * @param {Buffer} value
   */
  set mcosig(value: Buffer)
}
export declare const BaseMessageHeader: {
  msgNo: Buffer
}
export declare const CompressedHeader: {
  uncompressedLength: Buffer
  data: Buffer
}
/**
 * @type {InpsCommandMap[]}
 */
export declare const NPS_LOGIN_COMMANDS: InpsCommandMap[]
/**
 * @type {InpsCommandMap[]}
 */
export declare const NPS_COMMANDS: InpsCommandMap[]
