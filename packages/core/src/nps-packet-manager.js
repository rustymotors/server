// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { pino: P } = require("pino");

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
  /** @type {string} */
  npsKey;
  /** @type {IMsgNameMapping[]} */
  msgNameMapping = [];


  /**
   *
   * @returns {NPSPacketManager}
   */
  static getInstance() {
    if (typeof NPSPacketManager._instance === "undefined") {
      NPSPacketManager._instance = new NPSPacketManager();
    }

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
  }

  /**
   *
   * @param {number} messageId
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
   * @param {import("../../transactions/src/types").UnprocessedPacket} rawPacket
   * @param {import("../../login/src/index").LoginServer} loginServer
   * @param {import("../../persona/src/index").PersonaServer} personaServer
   * @param {import("../../lobby/src/index").LobbyServer} lobbyServer
   * @param {import("../../database/src/index").DatabaseManager} databaseManager
   * @return {Promise<import("../../core/src/tcpConnection").TCPConnection>}
   */
  async processNPSPacket(rawPacket, loginServer, personaServer, lobbyServer, databaseManager) {
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
        return loginServer.dataHandler(rawPacket);
      case 8228:
        return personaServer.dataHandler(rawPacket);
      case 7003:
        return lobbyServer.dataHandler(rawPacket, personaServer, databaseManager);
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
