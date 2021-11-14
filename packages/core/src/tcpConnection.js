// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { createCipheriv, createDecipheriv } = require("crypto");
const { pino: P } = require("pino");
const { EConnectionStatus } = require("./types.js");
const { Buffer } = require("buffer");

const log = P().child({ service: "mcos:TCPConnection" });
log.level = process.env["LOG_LEVEL"] || "info";

class TCPConnection {
  /** @type {string} */
  id;
  /** @type {number} */
  appId;
  /** @type {EConnectionStatus} */
  status;
  /** @type {string | undefined} */
  remoteAddress;
  /** @type {number} */
  localPort;
  /** @type {import("net").Socket} */
  sock;
  msgEvent = null;
  /** @type {number} */
  lastMsg;
  /** @type {boolean} */
  useEncryption;
  /**
   * @private
   * @type {import("./types").LobbyCiphers}
   */
  encLobby = {
    cipher: undefined,
    decipher: undefined,
  };
  /**
   * @private
   * @type {import("./encryption-mgr").EncryptionManager | undefined}
   */
  enc;
  /** @type {boolean} */
  isSetupComplete;

  /** @type {boolean} */
  inQueue;
  /**
   * @type {Buffer | undefined}
   */
  encryptedCmd;
  /** @type {Buffer | undefined} */
  decryptedCmd;

  /**
   *
   * @param {string} connectionId
   * @param {import("net").Socket} sock
   */
  constructor(connectionId, sock) {
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
    /** @type {import("./types").LobbyCiphers} */
    this.encLobby = {
      cipher: undefined,
      decipher: undefined,
    };
    this.isSetupComplete = false;
    this.inQueue = true;
  }

  /**
   *
   * @returns {boolean}
   */
  isLobbyKeysetReady() {
    return (
      this.encLobby.cipher !== undefined && this.encLobby.decipher !== undefined
    );
  }

  /**
   *
   * @param {import("./encryption-mgr").EncryptionManager} encryptionManager
   */
  setEncryptionManager(encryptionManager) {
    this.enc = encryptionManager;
  }

  /**
   *
   * @returns {string}
   */
  getEncryptionId() {
    if (this.enc === undefined) {
      throw new Error("Encryption manager not set");
    }
    return this.enc.getId();
  }

  /**
   *
   * @param {Buffer} buffer
   * @returns {Buffer}
   */
  encryptBuffer(buffer) {
    if (this.enc === undefined) {
      throw new Error("Encryption manager not set");
    }
    return this.enc.encrypt(buffer);
  }

  /**
   *
   * @param {Buffer} buffer
   * @returns {Buffer}
   */
  decryptBuffer(buffer) {
    if (this.enc === undefined) {
      throw new Error("Encryption manager not set");
    }
    return this.enc.decrypt(buffer);
  }

  /**
   *
   * @param {Buffer} key
   */
  setEncryptionKey(key) {
    if (this.enc === undefined) {
      throw new Error("Encryption manager is not set");
    }
    this.isSetupComplete = this.enc.setEncryptionKey(key);
  }

  /**
   * @param {string} skey
   */
  setEncryptionKeyDES(skey) {
    // Deepcode ignore HardcodedSecret: This uses an empty IV
    const desIV = Buffer.alloc(8);

    try {
      this.encLobby.cipher = createCipheriv(
        "des-cbc",
        Buffer.from(skey, "hex"),
        desIV
      );
      this.encLobby.cipher.setAutoPadding(false);
    } catch (error) {
      throw new Error(`Error setting cipher: ${error}`);
    }

    try {
      this.encLobby.decipher = createDecipheriv(
        "des-cbc",
        Buffer.from(skey, "hex"),
        desIV
      );
      this.encLobby.decipher.setAutoPadding(false);
    } catch (error) {
      throw new Error(`Error setting decipher: ${error}`);
    }

    this.isSetupComplete = true;
  }

  /**
   * CipherBufferDES
   *
   * @param {Buffer} messageBuffer
   * @return {Buffer}
   */
  cipherBufferDES(messageBuffer) {
    if (this.encLobby.cipher) {
      return this.encLobby.cipher.update(messageBuffer);
    }

    throw new Error("No DES cipher set on connection");
  }

  /**
   * DecipherBufferDES
   *
   * @param {Buffer} messageBuffer
   * @return {Buffer}
   */
  decipherBufferDES(messageBuffer) {
    if (this.encLobby.decipher) {
      return this.encLobby.decipher.update(messageBuffer);
    }

    throw new Error("No DES decipher set on connection");
  }

  /**
   *
   * @param {import("../../transactions/src/types").UnprocessedPacket} packet
   * @param {import("./connection-mgr").ConnectionManager} connectionManager
   * @param {import("../../login/src/index").LoginServer} loginServer
   * @param {import("../../persona/src/index").PersonaServer} personaServer
   * @param {import("../../lobby/src/index").LobbyServer} lobbyServer
   * @param {import("../../transactions/src/index").MCOTServer} mcotServer
   * @param {import("../../database/src/index").DatabaseManager} databaseManager
   * @returns {Promise<TCPConnection>}
   */
  async processPacket(
    packet,
    connectionManager,
    loginServer,
    personaServer,
    lobbyServer,
    mcotServer,
    databaseManager
  ) {
    try {
      return connectionManager.processData(
        packet,
        loginServer,
        personaServer,
        lobbyServer,
        mcotServer,
        databaseManager
      );
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
}
module.exports = { TCPConnection };
