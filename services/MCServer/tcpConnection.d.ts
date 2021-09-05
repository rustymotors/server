/// <reference types="node" />
/**
 * Contains the proporties and methods for a TCP connection
 */
/**
 * @typedef {'Active' | 'Inactive'} ConnectionStatus
 */
/**
 * @typedef LobbyCiphers
 * @property { crypto.Cipher | null } cipher
 * @property { crypto.Decipher | null} decipher
 */
/**
 * @class
 * @property {string} id
 * @property {number} appId
 * @property {ConnectionStatus} status
 * @property {string} remoteAddress
 * @property {string} localPort
 * @property {import("net").Socket} sock
 * @property {null} msgEvent
 * @property {number} lastMsg
 * @property {boolean} useEncryption
 * @property {LobbyCiphers} encLobby
 * @property {EncryptionManager} enc
 * @property {boolean} isSetupComplete
 * @property {module:ConnectionMgr.ConnectionMgr} mgr
 * @property {boolean} inQueue
 * @property {Buffer} decryptedCmd
 * @property {Buffer} encryptedCmd
 */
export class TCPConnection {
  /**
   *
   * @param {string} connectionId
   * @param {import("net").Socket} sock
   * @param {ConnectionManager} mgr
   */
  constructor(
    connectionId: string,
    sock: import('net').Socket,
    mgr: ConnectionManager,
  )
  id: string
  appId: number
  status: string
  remoteAddress: string
  localPort: number
  sock: Socket
  msgEvent: any
  lastMsg: number
  useEncryption: boolean
  encLobby: {
    cipher: any
    decipher: any
  }
  enc: EncryptionManager
  isSetupComplete: boolean
  mgr: ConnectionManager
  inQueue: boolean
  decryptedCmd: Buffer
  encryptedCmd: Buffer
  /**
   *
   * @param {Buffer} key
   * @return {void}
   */
  setEncryptionKey(key: Buffer): void
  /**
   * SetEncryptionKeyDES
   *
   * @param {string} skey
   * @return {void}
   */
  setEncryptionKeyDES(skey: string): void
  /**
   * CipherBufferDES
   *
   * @param {Buffer} messageBuffer
   * @return {Buffer}
   */
  cipherBufferDES(messageBuffer: Buffer): Buffer
  /**
   * DecipherBufferDES
   *
   * @param {Buffer} messageBuffer
   * @return {Buffer}
   */
  decipherBufferDES(messageBuffer: Buffer): Buffer
}
export type ConnectionStatus = 'Active' | 'Inactive'
export type LobbyCiphers = {
  cipher: any | null
  decipher: any | null
}
import { Socket } from 'net'
import { EncryptionManager } from './encryption-mgr.js'
import { ConnectionManager } from './connection-mgr.js'
import { Buffer } from 'buffer'
