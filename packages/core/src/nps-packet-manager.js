// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { pino: P } = require("pino");
const { LobbyServer } = require("../../lobby/src/index.js");
const { LoginServer } = require("../../login/src/index.js");
const { PersonaServer } = require("../../persona/src/index.js");
const { DatabaseManager } = require("../../database/src/index.js");
const { getConfig } = require("../../config/src/index.js");

const log = P().child({ service: "mcos:NPSPacketManager" });
log.level = process.env["LOG_LEVEL"] || "info";

/**
 * @module npsPacketManager
 */

/**
 * @typedef IMsgNameMapping
 * @property {number} id
 * @property {string} name
 */

class NPSPacketManager {
  /** @type {NPSPacketManager} */
  static _instance;
  database;
  /** @type {string} */
  npsKey;
  /** @type {IMsgNameMapping[]} */
  msgNameMapping = [];
  /** @type {LoginServer} */
  loginServer;
  /** @type {PersonaServer} */
  personaServer;
  /** @type {LobbyServer} */
  lobbyServer;

  /**
   *
   * @returns {Promise<NPSPacketManager>}
   */
  static async getInstance() {
    if (typeof NPSPacketManager._instance === "undefined") {
      NPSPacketManager._instance = new NPSPacketManager();
    }

    NPSPacketManager._instance.database = await DatabaseManager.getInstance(
      getConfig()
    );
    NPSPacketManager._instance.loginServer = LoginServer.getInstance();

    return NPSPacketManager._instance;
  }

  constructor() {
    this.npsKey = "";
    this.msgNameMapping = [
      { id: 0x1_00, name: "NPS_LOGIN" },
      { id: 0x1_20, name: "NPS_LOGIN_RESP" },
      { id: 0x1_28, name: "NPS_GET_MINI_USER_LIST" },
      { id: 0x2_07, name: "NPS_ACK" },
      { id: 0x2_17, name: "NPS_HEATBEAT" },
      { id: 0x2_29, name: "NPS_MINI_USER_LIST" },
      { id: 0x3_0c, name: "NPS_SEND_MINI_RIFF_LIST" },
      { id: 0x5_01, name: "NPS_USER_LOGIN" },
      { id: 0x5_03, name: "NPS_REGISTER_GAME_LOGIN" },
      { id: 0x5_07, name: "NPS_NEW_GAME_ACCOUNT" },
      { id: 0x5_32, name: "NPS_GET_PERSONA_MAPS" },
      { id: 0x6_07, name: "NPS_GAME_ACCOUNT_INFO" },
      { id: 0x11_01, name: "NPS_CRYPTO_DES_CBC" },
    ];

    this.personaServer = PersonaServer.getInstance();
    this.lobbyServer = LobbyServer.getInstance();
  }

  /**
   *
   * @param {number} msgId
   * @return {string}
   */
  msgCodetoName(messageId) {
    const mapping = this.msgNameMapping.find((code) => code.id === messageId);
    return mapping ? mapping.name : "Unknown msgId";
  }

  /**
   *
   * @return {string}
   */
  getNPSKey() {
    return this.npsKey;
  }

  /**
   *
   * @param {string} key
   */
  setNPSKey(key) {
    this.npsKey = key;
  }

  /**
   *
   * @param {import("../../transactions/src/tcp-manager").UnprocessedPacket} rawPacket
   * @return {Promise<TCPConnection>}
   */
  async processNPSPacket(rawPacket) {
    const messageId = rawPacket.data.readInt16BE(0);
    log.info(
      `Handling message,
      ${JSON.stringify({
        msgName: this.msgCodetoName(messageId),
        msgId: messageId,
      })}`
    );

    const { localPort } = rawPacket;

    switch (localPort) {
      case 8226:
        return this.loginServer.dataHandler(rawPacket);
      case 8228:
        return this.personaServer.dataHandler(rawPacket);
      case 7003:
        return this.lobbyServer.dataHandler(rawPacket);
      default:
        process.exitCode = -1;
        throw new Error(
          `[npsPacketManager] Recieved a packet',
          ${JSON.stringify({
            msgId: messageId,
            localPort,
          })}`
        );
    }
  }
}
module.exports = { NPSPacketManager };
