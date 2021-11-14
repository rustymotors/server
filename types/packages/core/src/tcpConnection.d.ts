/// <reference types="node" />
export class TCPConnection {
  /**
   *
   * @param {string} connectionId
   * @param {Socket} sock
   */
  constructor(connectionId: string, sock: Socket);
  /** @type {string} */
  id: string;
  /** @type {number} */
  appId: number;
  /** @type {EConnectionStatus} */
  status: any;
  /** @type {string | undefined} */
  remoteAddress: string | undefined;
  /** @type {number} */
  localPort: number;
  /** @type {Socket} */
  sock: Socket;
  msgEvent: any;
  /** @type {number} */
  lastMsg: number;
  /** @type {boolean} */
  useEncryption: boolean;
  /**
   * @private
   * @type {LobbyCiphers}
   */
  private encLobby;
  /**
   * @private
   * @type {EncryptionManager | undefined}
   */
  private enc;
  /** @type {boolean} */
  isSetupComplete: boolean;
  /**
   * @private
   * @type {ConnectionManager | undefined}
   */
  private mgr;
  /** @type {boolean} */
  inQueue: boolean;
  /**
   * @type {Buffer | undefined}
   */
  encryptedCmd: Buffer | undefined;
  /** @type {Buffer | undefined} */
  decryptedCmd: Buffer | undefined;
  /**
   *
   * @returns {boolean}
   */
  isLobbyKeysetReady(): boolean;
  /**
   *
   * @param {string} remoteAddress
   * @param {number} localPort
   * @param {TCPConnection} newConnection
   */
  updateConnectionByAddressAndPort(
    remoteAddress: string,
    localPort: number,
    newConnection: TCPConnection
  ): Promise<void>;
  /**
   *
   * @param {ConnectionManager} manager
   */
  setManager(manager: ConnectionManager): void;
  /**
   *
   * @param {EncryptionManager} encryptionManager
   */
  setEncryptionManager(encryptionManager: EncryptionManager): void;
  /**
   *
   * @returns {string}
   */
  getEncryptionId(): string;
  /**
   *
   * @param {Buffer} buffer
   * @returns {Buffer}
   */
  encryptBuffer(buffer: Buffer): Buffer;
  /**
   *
   * @param {Buffer} buffer
   * @returns {Buffer}
   */
  decryptBuffer(buffer: Buffer): Buffer;
  /**
   *
   * @param {Buffer} key
   */
  setEncryptionKey(key: Buffer): void;
  /**
   * @param {string} skey
   */
  setEncryptionKeyDES(skey: string): void;
  /**
   * CipherBufferDES
   *
   * @param {Buffer} messageBuffer
   * @return {Buffer}
   */
  cipherBufferDES(messageBuffer: Buffer): Buffer;
  /**
   * DecipherBufferDES
   *
   * @param {Buffer} messageBuffer
   * @return {Buffer}
   */
  decipherBufferDES(messageBuffer: Buffer): Buffer;
  /**
   *
   * @param {UnprocessedPacket} packet
   * @returns {Promise<TCPConnection>}
   */
  processPacket(packet: any): Promise<TCPConnection>;
}
import { Socket } from "net";
import { ConnectionManager } from "./connection-mgr";
import { EncryptionManager } from "./encryption-mgr";
