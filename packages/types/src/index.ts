import { Cipher, Decipher } from "crypto";
import { Socket } from "net";

export interface IEncryptionManager {
  id: string
  sessionkey: Buffer;
  in: Decipher | undefined
  out: Cipher | undefined
}

export interface IConnectionManager {
  _instance: IConnectionManager
  connections: ITCPConnection[]
  newConnectionId: number
  banList: string[]
  serviceName: string
}

export interface ITCPConnection {
  id: string
  appId: number
  status: string
  remoteAddress: string | undefined
  localPort: number
  sock: Socket
  msgEvent: null
  lastMsg: number
  useEncryption: boolean
  encLobby: { cipher: Cipher | undefined; decipher: Decipher | undefined }
  enc: IEncryptionManager
  isSetupComplete: boolean
  mgr: IConnectionManager
  inQueue: boolean
  decryptedCmd: Buffer
  encryptedCmd: Buffer
}

export interface IRawPacket {
  connectionId: string
  connection: ITCPConnection
  data: Buffer
  localPort: number | undefined
  remoteAddress: string | undefined
  timestamp: number
}

export interface ISessionRecord {
  skey: string
  sessionkey: string
}

export interface IPersonaRecord {
  customerId: number
  id: Buffer
  maxPersonas: Buffer
  name: Buffer
  personaCount: Buffer
  shardId: Buffer
}

export interface ISslOptions {
  cert: string
  honorCipherOrder: boolean
  key: string
  rejectUnauthorized: boolean
}

export interface IUserRecordMini {
  contextId: string
  customerId: number
  userId: number
}

export interface InpsCommandMap {
  name: string
  value: number
  module: 'Lobby' | 'Login'
}

export enum EServerConnectionName {
  ADMIN = 'Admin',
  AUTH = 'Auth',
  MCSERVER = 'MCServer',
  PATCH = 'Patch',
  PROXY = 'Proxy',
  SHARD = 'Shard',
}

export enum EServerConnectionAction {
  REGISTER_SERVICE = 'Register Service',
}

export enum EServiceQuery {
  GET_CONNECTIONS = 'Get connections',
}

export interface IServerConnection {
  action?: EServerConnectionAction
  service: EServerConnectionName
  host: string
  port: number
}

export interface IAppConfiguration {
  certificate: {
    privateKeyFilename: string
    publicKeyFilename: string
    certFilename: string
  },
  serverSettings: {
    ipServer: string
  },
  serviceConnections: {
    databaseURL: string
  },
  defaultLogLevel: string
}