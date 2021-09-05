/// <reference types="node" />
export namespace _NPS_RiffListHeader {
  const StructSize: Buffer
  const NumRiffs: Buffer
}
export namespace _NPS_RiffInfo {
  const Riff: Buffer
  const Protocol: Buffer
  const CommId: Buffer
  const Password: Buffer
  const ChannelType: Buffer
  const ConnectedUsers: Buffer
  const OpenChannels: Buffer
  const UserIsConnected: Buffer
  const ChannelData: Buffer
  const NumberOfReadyPlayers: Buffer
  const MaxReadyPlayers: Buffer
  const MasterUserId: Buffer
  const GameServerISRunning: Buffer
}
export namespace LobbyMessage {
  const msgNo: Buffer
  const noLobbies: Buffer
  const moreToCome: Buffer
  const lobbyInfo: Buffer
}
export namespace LobbyInfo {
  const lobbyID: Buffer
  const raceTypeID: Buffer
  const turfID: Buffer
  const NPSRiffName: Buffer
  const eTurfName: Buffer
  const clientArt: Buffer
  const elementID: Buffer
  const turfLength: Buffer
  const startSlice: Buffer
  const endSlice: Buffer
  const dragStageLeft: Buffer
  const dragStageRight: Buffer
  const dragStagingSlice: Buffer
  const gridSpreadFactor: Buffer
  const linear: Buffer
  const numplayersmin: Buffer
  const numplayersmax: Buffer
  const numplayersdefault: Buffer
  const bnumplayersenabled: Buffer
  const numlapsmin: Buffer
  const numlapsmax: Buffer
  const numlapsdefault: Buffer
  const bnumlapsenabled: Buffer
  const numroundsmin: Buffer
  const numroundsmax: Buffer
  const numroundsdefault: Buffer
  const bnumroundsenabled: Buffer
  const bweatherdefault: Buffer
  const bweatherenabled: Buffer
  const bnightdefault: Buffer
  const bnightenabled: Buffer
  const bbackwardsdefault: Buffer
  const bbackwardsenabled: Buffer
  const btrafficdefault: Buffer
  const btrafficenabled: Buffer
  const bdamagedefault: Buffer
  const bdamageenabled: Buffer
  const baidefault: Buffer
  const baienabled: Buffer
  const topDog: Buffer
  const turfOwner: Buffer
  const qualifyingTime: Buffer
  const clubNumPlayers: Buffer
  const clubNumLaps: Buffer
  const blubNumRounds: Buffer
  const clubNight: Buffer
  const clubWeather: Buffer
  const clubBackwards: Buffer
  const bestLapTime: Buffer
  const lobbyDifficulty: Buffer
  const ttPointForQualify: Buffer
  const ttCashForQualify: Buffer
  const ttPointBonusFasterIncs: Buffer
  const ttCashBonusFasterIncs: Buffer
  const ttTimeIncrements: Buffer
  const ttvictory_1st_points: Buffer
  const ttvictory_1st_cash: Buffer
  const ttvictory_2nd_points: Buffer
  const ttvictory_2nd_cash: Buffer
  const ttvictory_3rd_points: Buffer
  const ttvictory_3rd_cash: Buffer
  const minLevel: Buffer
  const minResetSlice: Buffer
  const maxResetSlice: Buffer
  const newbieFlag: Buffer
  const driverHelmetFlag: Buffer
  const clubNumPlayersMax: Buffer
  const clubNumPlayersMin: Buffer
  const clubNumPlayersDefault: Buffer
  const numClubsMax: Buffer
  const numClubsMin: Buffer
  const racePointsFactor: Buffer
  const bodyClassMax: Buffer
  const powerClassMax: Buffer
  const partPrizesMax: Buffer
  const partPrizesWon: Buffer
  const clubLogoID: Buffer
  const bteamtrialweather: Buffer
  const bteamtrialnight: Buffer
  const bteamtrialbackwards: Buffer
  const teamtrialnumlaps: Buffer
  const teamtrialbaseTUP: Buffer
  const raceCashFactor: Buffer
}
export namespace GLDP_Persona {
  const customerId_: Buffer
  const personaId_: Buffer
  const creationDate_: Buffer
  const personaName_: Buffer
}
export namespace _UserGameData {
  const CustomerId: Buffer
  const GameUserName: Buffer
  const ServerDataId: Buffer
  const CreateDate: Buffer
  const LastLogin: Buffer
  const NumGames: Buffer
  const GameUserId: Buffer
  const IsOnSystem: Buffer
  const GamePurchaseDate: Buffer
  const GameSerialNumber: Buffer
  const TimeOnline: Buffer
  const TimeInGame: Buffer
  const GameSpecific: Buffer
  const PersonalBlob: Buffer
  const PictureBlob: Buffer
  const DND: Buffer
  const GameStart: Buffer
  const CurrentKey: Buffer
  const PersonaLevle: Buffer
  const ShardId: Buffer
}
export namespace GLDP_PersonaList {
  const NPS_SerializeList: Buffer
  const maxPersonas_: Buffer
}
export namespace GenericReply {
  const msgNo_1: Buffer
  export { msgNo_1 as msgNo }
  export const msgReply: Buffer
  export const result: Buffer
  export const data: Buffer
  export const data2: Buffer
}
export namespace NPS_GetPersonaMapListRequest {
  const NPS_SerializeList_1: Buffer
  export { NPS_SerializeList_1 as NPS_SerializeList }
  const customerId__1: Buffer
  export { customerId__1 as customerId_ }
}
/**
 * @property {Buffer} _length
 * @property {Buffer} _mcosig
 */
export class MessageHead {
  _length: Buffer
  _mcosig: Buffer
  /**
   * @return {number}
   */
  getLength(): number
  /**
   * @param {number} value
   */
  setLength(value: number): void
  /**
   * @return {Buffer}
   */
  getMcosig(): Buffer
  /**
   * @param {Buffer} value
   */
  setMcosig(value: Buffer): void
}
export namespace BaseMessageHeader {
  const msgNo_2: Buffer
  export { msgNo_2 as msgNo }
}
export namespace CompressedHeader {
  export const uncompressedLength: Buffer
  const data_1: Buffer
  export { data_1 as data }
}
/**
 * @type {InpsCommandMap[]}
 */
export const NPS_LOGIN_COMMANDS: any[]
/**
 * @type {InpsCommandMap[]}
 */
export const NPS_COMMANDS: any[]
import { Buffer } from 'buffer'
