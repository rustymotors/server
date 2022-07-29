import type { Cipher, Decipher } from "node:crypto"
import type { Socket } from "node:net"

export enum ECONNECTION_STATUS {
  'Active' = 'Active',
  'Inactive' = 'Inactive'
}

export type LobbyCiphers = {
  cipher?: Cipher
  decipher?: Decipher
}

export type FIELD_TYPE = 'boolean' | 'binary' | 'byte' | 'char' | 'u16' | 'u32'


export type EncryptionSession = {
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
   * Socket with connection properties
   */
 export type SocketWithConnectionInfo = {
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

export type BufferWithConnection = {
  connectionId: string
  connection: SocketWithConnectionInfo
  data: Buffer
  timestamp: number
}

export type SessionRecord = {
  skey: string
  sessionkey: string
}
