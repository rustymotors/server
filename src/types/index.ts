import { Cipher, Decipher } from "crypto";
import { TCPConnection } from "../core/tcpConnection";

export type LobbyCipers = {
  cipher?: Cipher;
  decipher?: Decipher;
};

export type UnprocessedPacket = {
  connectionId: string;
  connection: TCPConnection;
  data: Buffer;
  timestamp: number;
};

export type SessionRecord = {
  skey: string;
  sessionkey: string;
};

export type PersonaRecord = {
  customerId: number;
  id: Buffer;
  maxPersonas: Buffer;
  name: Buffer;
  personaCount: Buffer;
  shardId: Buffer;
};

export type SslOptions = {
  cert: string;
  honorCipherOrder: boolean;
  key: string;
  rejectUnauthorized: boolean;
};

export type UserRecordMini = {
  contextId: string;
  customerId: number;
  userId: number;
};

export type NpsCommandMap = {
  name: string;
  value: number;
  module: "Lobby" | "Login";
};

export const _NPS_RiffListHeader = {
  StructSize: Buffer.alloc(4), // Uint4B
  NumRiffs: Buffer.alloc(4), // UInt4B
};

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
  GameServerISRunning: Buffer.alloc(1), // Char
};

export const LobbyMessage = {
  msgNo: Buffer.alloc(4), // Uint4B
  noLobbies: Buffer.alloc(4), // Uint4B
  moreToCome: Buffer.alloc(4), // Uint4B
  lobbyInfo: Buffer.alloc(142), // [142] LobbyInfo
};

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
  raceCashFactor: Buffer.alloc(4), // Float (4B)
};

export const GLDP_Persona = {
  customerId_: Buffer.alloc(4), // Uint4B
  personaId_: Buffer.alloc(4), // Uint4B
  creationDate_: Buffer.alloc(4), // Int4B
  personaName_: Buffer.alloc(33), // [33] Char
};

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
  ShardId: Buffer.alloc(4), // Uint4B
};

export const GLDP_PersonaList = {
  NPS_SerializeList: Buffer.alloc(48), // NPS_SerializeList
  maxPersonas_: Buffer.alloc(4), // Uint4B
};

export const GenericReply = {
  msgNo: Buffer.alloc(4), // Uint4B
  msgReply: Buffer.alloc(4), // Uint4B
  result: Buffer.alloc(4), // Uint4B
  data: Buffer.alloc(4), // Uint4B
  data2: Buffer.alloc(4), // Uint4B
};

export const NPS_GetPersonaMapListRequest = {
  NPS_SerializeList: Buffer.alloc(48), // NPS_SerializeList
  customerId_: Buffer.alloc(4), // Uint4B
};

/**
 * @property {Buffer} _length
 * @property {Buffer} _mcosig
 */
export class MessageHead {
  private _length: Buffer;
  private _mcosig: Buffer;
  /**
   *
   */
  constructor() {
    // This is a 4B in the debug binary, the client is sending 2B
    /** @type {Buffer} */
    this._length = Buffer.alloc(2); // UInt4B
    /** @type {Buffer} */
    this._mcosig = Buffer.alloc(4); // UInt4B
  }
}

export const BaseMessageHeader = {
  msgNo: Buffer.alloc(4), // Uint4B
};

export const CompressedHeader = {
  uncompressedLength: Buffer.alloc(4), // Uint4B
  data: Buffer.alloc(0), // [0] Uint4B
};

/**
 * Commands from the game server to the game client
 */
const NPS_LOBBYSERVER_COMMANDS: NpsCommandMap[] = [
  { name: "NPS_FORCE_LOGOFF", value: 513, module: "Lobby" },
  { name: "NPS_USER_LEFT", value: 514, module: "Lobby" },
  { name: "NPS_USER_JOINED", value: 515, module: "Lobby" },
  { name: "NPS_USER_INFO", value: 516, module: "Lobby" },
  { name: "NPS_SYSTEM_ALERT", value: 517, module: "Lobby" },
  { name: "NPS_CLIENT_COUNT", value: 518, module: "Lobby" },
  { name: "NPS_ACK", value: 519, module: "Lobby" },
  { name: "NPS_USER_LEFT_CHANNEL", value: 520, module: "Lobby" },
  { name: "NPS_CHANNEL_CLOSED", value: 521, module: "Lobby" },
  { name: "NPS_DUP_USER", value: 522, module: "Lobby" },
  { name: "NPS_SERVER_FULL", value: 523, module: "Lobby" },
  { name: "NPS_USER_JOINED_CHANNEL", value: 524, module: "Lobby" },
  { name: "NPS_SERVER_INFO", value: 525, module: "Lobby" },
  { name: "NPS_CHANNEL_CREATED", value: 526, module: "Lobby" },
  { name: "NPS_CHANNEL_DELETED", value: 527, module: "Lobby" },
  { name: "NPS_READY_LIST", value: 528, module: "Lobby" },
  { name: "NPS_USER_LIST", value: 529, module: "Lobby" },
  { name: "NPS_SERVER_LIST", value: 530, module: "Lobby" },
  { name: "NPS_CHANNEL_DENIED", value: 531, module: "Lobby" },
  { name: "NPS_CHANNEL_GRANTED", value: 532, module: "Lobby" },
  { name: "NPS_CHANNEL_CONDITIONAL", value: 533, module: "Lobby" },
  { name: "NPS_SERVER_REDIRECT", value: 534, module: "Lobby" },
  { name: "NPS_HEARTBEAT", value: 535, module: "Lobby" },
  { name: "NPS_HEARTBEAT_TIMEOUT", value: 536, module: "Lobby" },
  { name: "NPS_CHANNEL_UPDATE", value: 537, module: "Lobby" },
  { name: "NPS_FORCE_LEAVE_CHANNEL", value: 538, module: "Lobby" },
  { name: "NPS_USER_LOCATION", value: 539, module: "Lobby" },
  { name: "NPS_GAME_SERVER_STARTED", value: 540, module: "Lobby" },
  { name: "NPS_GAME_SERVER_TERMINATED", value: 541, module: "Lobby" },
  { name: "NPS_VERSIONS_DIFFERENT", value: 542, module: "Lobby" },
  { name: "NPS_SEND_VERSION_STRING", value: 543, module: "Lobby" },
  { name: "NPS_GAME_SKU_REGISTRY_KEY", value: 544, module: "Lobby" },
  { name: "NPS_PLUGIN_ACK", value: 545, module: "Lobby" },
  { name: "NPS_SERVER_CRASHED", value: 546, module: "Lobby" },
  { name: "NPS_OPEN_COMM_CHANNEL_ACK", value: 547, module: "Lobby" },
  { name: "NPS_GAME_SERVER_STATE_CHANGE", value: 548, module: "Lobby" },
  { name: "NPS_SLOT_UPDATE", value: 549, module: "Lobby" },
  { name: "NPS_SLOT_LIST", value: 550, module: "Lobby" },
  { name: "NPS_CHANNEL_MASTER", value: 551, module: "Lobby" },
  { name: "NPS_CHANNEL_MASTER_LIST", value: 552, module: "Lobby" },
  { name: "NPS_MINI_USER_LIST", value: 553, module: "Lobby" },
  { name: "NPS_INVALID_KEY", value: 554, module: "Lobby" },
  { name: "NPS_NO_VALIDATION_SERVER", value: 555, module: "Lobby" },
  { name: "NPS_INC_MINI_USER_LIST", value: 556, module: "Lobby" },
  { name: "NPS_DEC_MINI_USER_LIST", value: 557, module: "Lobby" },
  { name: "NPS_BUDDY_LIST", value: 558, module: "Lobby" },
  { name: "NPS_BUDDYLIST_UPDATE", value: 559, module: "Lobby" },
];

/**
 * Commands from the game client to the game server
 */
const NPS_LOBBYCLIENT_COMMANDS: NpsCommandMap[] = [
  { name: "NPS_LOGIN", value: 256, module: "Lobby" },
  { name: "NPS_GET_USER_LIST", value: 257, module: "Lobby" },
  { name: "NPS_GET_MY_USER_DATA", value: 258, module: "Lobby" },
  { name: "NPS_SET_MY_USER_DATA", value: 259, module: "Lobby" },
  { name: "NPS_LOG_OFF_SERVER", value: 260, module: "Lobby" },
  { name: "NPS_CLOSE_COMM_CHANNEL", value: 261, module: "Lobby" },
  { name: "NPS_OPEN_COMM_CHANNEL", value: 262, module: "Lobby" },
  { name: "NPS_GET_CLIENT_COUNT", value: 263, module: "Lobby" },
  { name: "NPS_START_GAME", value: 264, module: "Lobby" },
  { name: "NPS_READY_FOR_GAME", value: 265, module: "Lobby" },
  { name: "NPS_START_GAME_SERVER", value: 266, module: "Lobby" },
  { name: "NPS_SET_SLEEP_STATE", value: 267, module: "Lobby" },
  { name: "NPS_GET_SERVER_INFO", value: 268, module: "Lobby" },
  { name: "NPS_SET_COMM_FLAGS", value: 269, module: "Lobby" },
  { name: "NPS_GET_READY_LIST", value: 270, module: "Lobby" },
  { name: "NPS_SEND_SERVER_LIST", value: 271, module: "Lobby" },
  { name: "NPS_SET_COMM_CHANNEL_RATE", value: 272, module: "Lobby" },
  { name: "NPS_SET_HEARTBEAT_TIMEOUT", value: 273, module: "Lobby" },
  { name: "NPS_GET_HEARTBEAT_TIMEOUT", value: 274, module: "Lobby" },
  { name: "NPS_SET_CHANNEL_DATA", value: 275, module: "Lobby" },
  { name: "NPS_FILE_START", value: 276, module: "Lobby" },
  { name: "NPS_FILE_DATA", value: 277, module: "Lobby" },
  { name: "NPS_FILE_COMPLETED", value: 278, module: "Lobby" },
  { name: "NPS_BOOT_USER_FROM_CHANNEL", value: 279, module: "Lobby" },
  { name: "NPS_LOCATE_USER", value: 280, module: "Lobby" },
  { name: "NPS_ENABLE_FILTER", value: 281, module: "Lobby" },
  { name: "NPS_DISABLE_FILTER", value: 282, module: "Lobby" },
  { name: "NPS_SLEEP_SERVER", value: 283, module: "Lobby" },
  { name: "NPS_WAKE_SERVER", value: 284, module: "Lobby" },
  { name: "NPS_TERMINATE_GAME_SERVER", value: 285, module: "Lobby" },
  { name: "NPS_SEND_SKU_REGISTRY", value: 286, module: "Lobby" },
  { name: "NPS_SET_READY_FOR_GAME", value: 287, module: "Lobby" },
  { name: "NPS_LOGIN_RESP", value: 288, module: "Lobby" },
  { name: "NPS_SOCKET_RECONNECT", value: 289, module: "Lobby" },
  { name: "NPS_SET_SLOT", value: 290, module: "Lobby" },
  { name: "NPS_GET_SLOT_LIST", value: 291, module: "Lobby" },
  { name: "NPS_SET_CHANNEL_CLOSED", value: 292, module: "Lobby" },
  { name: "NPS_UDP_STATUS", value: 293, module: "Lobby" },
  { name: "NPS_GET_USER_INFO", value: 294, module: "Lobby" },
  { name: "NPS_GET_MASTER_LIST", value: 295, module: "Lobby" },
  { name: "NPS_GET_MINI_USER_LIST", value: 296, module: "Lobby" },
  { name: "NPS_UDP_FAILURE", value: 297, module: "Lobby" },
  { name: "NPS_BUDDYLIST_REFRESH", value: 298, module: "Lobby" },
  { name: "NPS_BUDDYLIST_ADD_USERS", value: 299, module: "Lobby" },
  { name: "NPS_BUDDYLIST_REMOVE_USERS", value: 300, module: "Lobby" },
];

/**
 * Commands from the game client to the login server
 */
const NPS_LOGINCLIENT_COMMANDS: NpsCommandMap[] = [
  { name: "NPS_USER_LOGIN", value: 1281, module: "Login" },
  { name: "NPS_GAME_LOGIN", value: 1282, module: "Login" },
  { name: "NPS_REGISTER_GAME_LOGIN", value: 1283, module: "Login" },
  { name: "NPS_SET_GAME_BLOB", value: 1284, module: "Login" },
  { name: "NPS_GET_NEXT_SERVER", value: 1285, module: "Login" },
  { name: "NPS_NEW_EA_ACCOUNT", value: 1286, module: "Login" },
  { name: "NPS_NEW_GAME_ACCOUNT", value: 1287, module: "Login" },
  { name: "NPS_UPDATE_EA_ACCOUNT", value: 1288, module: "Login" },
  { name: "NPS_UPDATE_GAME_ACCOUNT", value: 1289, module: "Login" },
  { name: "NPS_LOCATE_PLAYER", value: 1290, module: "Login" },
  { name: "NPS_GET_BUDDY_LIST", value: 1291, module: "Login" },
  { name: "NPS_ADD_BUDDY_LIST", value: 1292, module: "Login" },
  { name: "NPS_DELETE_BUDDY_LIST", value: 1293, module: "Login" },
  { name: "NPS_CLEAR_BUDDY_LIST", value: 1294, module: "Login" },
  { name: "NPS_REGISTER_GAME_LOGOUT", value: 1295, module: "Login" },
  { name: "NPS_GET_GENERIC_HS_DATA", value: 1296, module: "Login" },
  { name: "NPS_PUT_GENERIC_HS_DATA", value: 1297, module: "Login" },
  { name: "NPS_DELETE_GAME_PERSONA", value: 1298, module: "Login" },
  { name: "NPS_READ_SERVER_DATA_LIST", value: 1299, module: "Login" },
  { name: "NPS_DELETE GENERIC_HS_DATA", value: 1300, module: "Login" },
  { name: "NPS_GET_PLAYER_RANK", value: 1301, module: "Login" },
  { name: "NPS_GET_TOP_PLAYERS", value: 1302, module: "Login" },
  { name: "NPS_ADD_BUDDY_BY_NAME", value: 1303, module: "Login" },
  { name: "NPS_GET_BUDDY_INFO", value: 1304, module: "Login" },
  { name: "NPS_GET_PERSONA_INFO", value: 1305, module: "Login" },
  { name: "NPS_GET_LEADER_BOARD", value: 1306, module: "Login" },
  { name: "NPS_SRP_USERNAME", value: 1307, module: "Login" },
  { name: "NPS_SRP_NGS", value: 1308, module: "Login" },
  { name: "NPS_SRP_A", value: 1309, module: "Login" },
  { name: "NPS_SRP_B", value: 1310, module: "Login" },
  { name: "NPS_SRP_USER_VERIFY", value: 1311, module: "Login" },
  { name: "NPS_SRP_SERVER_VERIFY", value: 1312, module: "Login" },
  { name: "NPS_FILE_BUG_REPORT", value: 1313, module: "Login" },
  { name: "NPS_GET_GENERIC_FIELD_RANKING", value: 1314, module: "Login" },
  { name: "NPS_SEND_EMAIL", value: 1315, module: "Login" },
  { name: "NPS_RECEIVE_EMAIL", value: 1316, module: "Login" },
  { name: "NPS_DELETE_EMAILS", value: 1317, module: "Login" },
  { name: "NPS_LIST_EMAILS", value: 1318, module: "Login" },
  { name: "NPS_AAI_REQUEST", value: 1328, module: "Login" },
  { name: "NPS_AAI_CRACK", value: 1329, module: "Login" },
  { name: "NPS_GET_PERSONA_MAPS", value: 1330, module: "Login" },
  { name: "NPS_VALIDATE_PERSONA_NAME", value: 1331, module: "Login" },
  { name: "NPS_CHECK_TOKEN", value: 1332, module: "Login" },
  { name: "NPS_GET_USER_STATUS", value: 1333, module: "Login" },
];

const NPS_LOBBY_COMMANDS: NpsCommandMap[] = [
  ...NPS_LOBBYCLIENT_COMMANDS,
  ...NPS_LOBBYSERVER_COMMANDS,
];

export const NPS_LOGIN_COMMANDS: NpsCommandMap[] = [
  ...NPS_LOGINCLIENT_COMMANDS,
];

export const NPS_COMMANDS: NpsCommandMap[] = [
  ...NPS_LOBBY_COMMANDS,
  ...NPS_LOGINCLIENT_COMMANDS,
  { name: "NPS_CRYPTO_DES_CBC", value: 0x11_01, module: "Lobby" },
];

/**
 * @typedef {'RECEIVED' | 'SENT'} MESSAGE_DIRECTION
 *
 */
export enum EMessageDirection {
  RECEIVED = "received",
  SENT = "sent",
  UNDEFINED = "not set",
}

export interface IMessageNode {
  direction: EMessageDirection;
  msgNo: number;
  seq: number;
  flags: number;
  data: Buffer;
  dataLength: number;
  mcoSig: string;
  toFrom: number;
  appId: number;
  deserialize: (packet: Buffer) => void;
  serialize: () => Buffer;
  setAppId: (appId: number) => void;
  setMsgNo: (newMessageNo: number) => void;
  setSeq: (newSeq: number) => void;
  setMsgHeader: (packet: Buffer) => void;
  updateBuffer: (buffer: Buffer) => void;
  isMCOTS: () => boolean;
  dumpPacket: () => string;
  getLength: () => number;
  BaseMsgHeader: (packet: Buffer) => void;
}

export type ConnectionWithPacket = {
  connection: TCPConnection;
  packet: IMessageNode;
  lastError?: string;
};

export type ConnectionWithPackets = {
  connection: TCPConnection;
  packetList: IMessageNode[];
};
