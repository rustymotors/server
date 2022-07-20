import type { Cipher, Decipher } from 'node:crypto'
import type { Socket } from 'node:net'
import type { ITSMessageBase } from '../structures/TMessageBase.js'

export interface LobbyCiphers {
  cipher?: Cipher
  decipher?: Decipher
}

export interface SessionRecord {
  skey: string
  sessionkey: string
}


export interface PersonaRecord {
  customerId: number
  id: Buffer
  maxPersonas: Buffer
  name: Buffer
  personaCount: Buffer
  shardId: Buffer
}

export interface UserRecordMini {
  contextId: string,
  customerId: number,
  userId: number
}

export interface NpsCommandMap {
  name: string
  value: number
  module: 'Lobby' | 'Login'
}

export interface IMessageNode {
  direction: "sent" | "received"
  msgNo: number
  seq: number
  flags: number
  data: Buffer
  dataLength: number
  mcoSig: string
  toFrom: number
  appId: number
  rawPacket: Buffer
  deserialize: (packet: Buffer) => void
  serialize: () => Buffer
  setAppId: (appId: number) => void
  setMsgNo: (newMessageNo: number) => void
  setSeq: (newSeq: number) => void
  setMsgHeader: (packet: Buffer) => void
  updateBuffer: (buffer: Buffer) => void
  isMCOTS: () => boolean
  dumpPacket: () => string
  toString: () => string
  getLength: () => number
  BaseMsgHeader: (packet: { readInt16LE: (arg0: number) => number }) => void
}



export interface INPSMessage {
  msgNo: number
  msgVersion: number
  reserved: number
  content: Buffer
  msgLength: number
  direction: "sent" | "received"
  serviceName: string
  setContent: (buffer: Buffer) => void
  getContentAsBuffer: () => Buffer
  getPacketAsString: () => string
  serialize: () => Buffer
  deserialize: (packet: { readInt16BE: (arg0: number) => number; slice: (arg0: number) => Buffer }) => INPSMessage
  dumpPacketHeader: (messageType: string) => string
  dumpPacket: () => string

}

export interface INPSMessageJSON {
  msgNo: number
  opCode: number | null
  msgLength: number
  msgVersion: number
  content: string
  contextId: string
  direction: "sent" | "received"
  sessionkey: string | null
  rawBuffer: string
}

/**
 *
 *
 * @export
 * @typedef ICoreConfig
 * @property {string} externalHost
 * @property {number[]} [ports=[]]
 */

/**
   * Socket with connection properties
   */
export interface SocketWithConnectionInfo {
  socket: Socket
  seq: number
  id: string
  remoteAddress: string
  localPort: number
  personaId: number // appId
  lastMessageTimestamp: number
  inQueue: boolean
  useEncryption: boolean
  encryptionSession?: EncryptionSession
}

export interface BufferWithConnection {
  connectionId: string
  connection: SocketWithConnectionInfo
  data: Buffer
  timestamp: number
}

export interface EncryptionSession {
  connectionId: string
  remoteAddress: string
  localPort: number
  sessionKey: string
  shortKey: string
  gsCipher: Cipher // des-cbc, uses skey
  gsDecipher: Decipher // des-cbc, uses skey
  tsCipher: Cipher // rc4, uses sessionkey
  tsDecipher: Decipher // rc4, uses sessionkey
}

/**
 * N+ messages, ready for sending, with related connection
 */
export interface GSMessageArrayWithConnection {
  connection: SocketWithConnectionInfo
  messages: INPSMessage[]
}

/**
 * N+ messages, ready for sending, with related connection
 */
export interface TSMessageArrayWithConnection {
  connection: SocketWithConnectionInfo
  messages: IMessageNode[] | ITSMessageBase[]
}

export interface GServiceResponse {
  err: Error | null
  response?: GSMessageArrayWithConnection | undefined
}

export interface TServiceResponse {
  err: Error | null
  response?: TSMessageArrayWithConnection | undefined
}

/**
 * The blueprint for a service
 *
 * Takes in a buffer representing a single unprocessed raw message
 * and returns an array of processed message objects ready to send,
 * with the related connection object
 *
 * @export
 * @interface IServiceAPI
 * @param {BufferWithConnection} dataConnection
 * @return {ServiceResponse}
 */
