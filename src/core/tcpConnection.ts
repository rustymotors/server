// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { createCipheriv, createDecipheriv } from "crypto";
import type { Socket } from "net";
import { logger } from "../logger/index";
import { MessageNode } from "../message-types";
import type {
  ConnectionWithPacket,
  ConnectionWithPackets,
  LobbyCipers,
  UnprocessedPacket,
} from "../types/index";
import { ConnectionManager } from "./connection-mgr";
import { EncryptionManager } from "./encryption-mgr";

const log = logger.child({ service: "mcoserver:TCPConnection" });

export enum EConnectionStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

/**
 * Container for all TCP connections
 */
export class TCPConnection {
  id: string;
  appId: number;
  status: EConnectionStatus;
  remoteAddress?: string;
  localPort: number;
  sock: Socket;
  msgEvent: null;
  lastMsg: number;
  useEncryption: boolean;
  private encLobby: LobbyCipers;
  private enc?: EncryptionManager;
  isSetupComplete: boolean;
  private mgr?: ConnectionManager;
  inQueue: boolean;
  encryptedCmd?: Buffer;
  decryptedCmd?: Buffer;

  constructor(connectionId: string, sock: Socket) {
    if (typeof sock.localPort === "undefined") {
      throw new Error(
        `localPort is undefined, unable to create connection object`
      );
    }
    this.id = connectionId;
    this.appId = 0;
    this.status = EConnectionStatus.INACTIVE;
    this.remoteAddress = sock.remoteAddress || "";
    this.localPort = sock.localPort;
    this.sock = sock;
    this.msgEvent = null;
    this.lastMsg = 0;
    this.useEncryption = false;
    /** @type {LobbyCiphers} */
    this.encLobby = {};
    this.isSetupComplete = false;
    this.inQueue = true;
  }
  /**
   * Has the encryption keyset for lobby messages been created?
   * @returns {boolean}
   */
  isLobbyKeysetReady(): boolean {
    return (
      this.encLobby.cipher !== undefined && this.encLobby.decipher !== undefined
    );
  }

  /**
   * Update connection record
   * @param {string} remoteAddress
   * @param {number} localPort
   * @param {TCPConnection} newConnection
   * @returns {TCPConnection[]}
   */
  updateConnectionByAddressAndPort(
    remoteAddress: string,
    localPort: number,
    newConnection: TCPConnection
  ): TCPConnection[] {
    if (this.mgr === undefined) {
      throw new Error("Connection manager not set");
    }
    return this.mgr._updateConnectionByAddressAndPort(
      remoteAddress,
      localPort,
      newConnection
    );
  }

  /**
   * Set the connection manager
   * @param {ConnectionManager} manager
   * @returns {TCPConnection}
   */
  setManager(manager: ConnectionManager): TCPConnection {
    this.mgr = manager;
    return this;
  }

  /**
   * Set the encryption manager
   * @param encryptionManager
   * @returns {TCPConnection}
   */
  setEncryptionManager(encryptionManager: EncryptionManager): TCPConnection {
    this.enc = encryptionManager;
    return this;
  }

  /**
   * Return the encryption manager id
   * @returns {string}
   */
  getEncryptionId(): string {
    if (this.enc === undefined) {
      throw new Error("Encryption manager not set");
    }
    return this.enc.getId();
  }

  /**
   * Encrypt the buffer contents
   * @param {Buffer} buffer
   * @returns {Buffer}
   */
  encryptBuffer(buffer: Buffer): Buffer {
    if (this.enc === undefined) {
      throw new Error("Encryption manager not set");
    }
    return this.enc.encrypt(buffer);
  }

  /**
   * Decrypt the buffer contents
   * @param {Buffer} buffer
   * @returns {Buffer}
   */
  decryptBuffer(buffer: Buffer): Buffer {
    if (this.enc === undefined) {
      throw new Error("Encryption manager not set");
    }
    return this.enc.decrypt(buffer);
  }

  /**
   *
   * @param {Buffer} key
   * @return {void}
   */
  setEncryptionKey(key: Buffer): void {
    if (this.enc === undefined) {
      throw new Error("Encryption manager is not set");
    }
    this.isSetupComplete = this.enc.setEncryptionKey(key);
  }

  /**
   * SetEncryptionKeyDES
   *
   * @param {string} skey
   * @return {void}
   */
  setEncryptionKeyDES(skey: string): void {
    // Deepcode ignore HardcodedSecret: This uses an empty IV
    const desIV = Buffer.alloc(8);

    try {
      this.encLobby.cipher = createCipheriv(
        "des-cbc",
        Buffer.from(skey, "hex"),
        desIV
      );
      this.encLobby.cipher.setAutoPadding(false);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Error setting cipher: ${err.message}`);
      }
      throw err;
    }

    try {
      this.encLobby.decipher = createDecipheriv(
        "des-cbc",
        Buffer.from(skey, "hex"),
        desIV
      );
      this.encLobby.decipher.setAutoPadding(false);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Error setting decipher: ${err.message}`);
      }
      throw err;
    }

    this.isSetupComplete = true;
  }

  /**
   * CipherBufferDES
   *
   * @param {Buffer} messageBuffer
   * @return {Buffer}
   */
  cipherBufferDES(messageBuffer: Buffer): Buffer {
    if (this.encLobby.cipher) {
      return this.encLobby.cipher.update(messageBuffer);
    }

    throw new Error("No DES cipher set on connection");
  }

  /**
   * Decrypt a command that is encrypted with DES
   *
   */
  decipherBufferDES(messageBuffer: Buffer): Buffer {
    if (this.encLobby.decipher) {
      return this.encLobby.decipher.update(messageBuffer);
    }

    throw new Error("No DES decipher set on connection");
  }

  /**
   * Replays the unproccessed packet to the connection manager
   * @param {UnprocessedPacket} packet
   * @returns {Promise<TCPConnection>}
   */
  async processPacket(packet: UnprocessedPacket): Promise<TCPConnection> {
    if (this.mgr === undefined) {
      throw new Error("Connection manager is not set");
    }
    try {
      return this.mgr.processData(packet);
    } catch (error) {
      if (error instanceof Error) {
        const newError = new Error(
          `There was an error processing the packet: ${error.message}`
        );
        log.error(newError.message);
        throw newError;
      }
      throw error;
    }
  }

  /**
   *
   * @param {MessageNode} packet
   * @returns {Promise<ConnectionWithPacket>}
   */
  compressIfNeeded(packet: MessageNode): ConnectionWithPacket {
    // Check if compression is needed
    if (packet.getLength() < 80) {
      log.debug("Too small, should not compress");
      return {
        connection: this,
        packet,
        lastError: "Too small, should not compress",
      };
    } else {
      log.debug("This packet should be compressed");
      /* TODO: Write compression.
       *
       * At this time we will still send the packet, to not hang connection
       * Client will crash though, due to memory access errors
       */
    }

    return { connection: this, packet };
  }

  /**
   *
   * @param {MessageNode} packet
   * @returns {Promise<ConnectionWithPacket>}
   */
  encryptIfNeeded(packet: MessageNode): ConnectionWithPacket {
    // Check if encryption is needed
    if (packet.flags - 8 >= 0) {
      log.debug("encryption flag is set");

      packet.updateBuffer(this.encryptBuffer(packet.data));

      log.debug(`encrypted packet: ${packet.serialize().toString("hex")}`);
    }

    return { connection: this, packet };
  }

  /**
   * Attempt to write packet(s) to the socjet
   * @param {MessageNode[]} packetList
   * @returns {Promise<TCPConnection>}
   */
  tryWritePackets(packetList: MessageNode[]): TCPConnection {
    const updatedConnection: ConnectionWithPackets = {
      connection: this,
      packetList: packetList,
    };
    // For each node in nodes
    for (const packet of updatedConnection.packetList) {
      // Does the packet need to be compressed?
      const compressedPacket: MessageNode =
        this.compressIfNeeded(packet).packet;
      // Does the packet need to be encrypted?
      const encryptedPacket = this.encryptIfNeeded(compressedPacket).packet;
      // Log that we are trying to write
      log.debug(
        ` Atempting to write seq: ${encryptedPacket.seq} to conn: ${updatedConnection.connection.id}`
      );

      // Log the buffer we are writing
      log.debug(
        `Writting buffer: ${encryptedPacket.serialize().toString("hex")}`
      );
      if (this.sock.writable) {
        // Write the packet to socket
        this.sock.write(encryptedPacket.serialize());
      } else {
        const port: string = this.sock.localPort?.toString() || "";
        throw new Error(
          `Error writing ${encryptedPacket.serialize()} to ${
            this.sock.remoteAddress
          } , ${port}`
        );
      }
    }

    return updatedConnection.connection;
  }
}
