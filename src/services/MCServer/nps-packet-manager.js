// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import {log} from '@drazisil/mco-logger';
import {LobbyServer} from '../LobbyServer/lobby-server.js';
import {LoginServer} from '../LoginServer/login-server.js';
import {PersonaServer} from '../PersonaServer/persona-server.js';

/**
 * @module npsPacketManager
 */

/**
 * @typedef IMsgNameMapping
 * @property {number} id
 * @property {string} name
 */

/**
 * @class
 * @property {module:IAppSettings} config
 * @property {module:DatabaseManager} database
 * @property {string} npsKey
 * @property {module:npsPacketManager~IMsgNameMapping[]} msgNameMapping
 * @property {module:LoginServer} loginServer
 * @property {module:PersonaServer} personaServer
 * @property {module:LobbyServer} lobbyServer
 */
export class NPSPacketManager {
  /**
   *
   * @param {module:DatabaseManager} databaseMgr
   * @param {IAppSettings} appSettings
   */
  constructor(databaseMgr, appSettings) {
    this.config = appSettings;
    this.database = databaseMgr;
    this.npsKey = '';
    this.msgNameMapping = [
      {id: 0x1_00, name: 'NPS_LOGIN'},
      {id: 0x1_20, name: 'NPS_LOGIN_RESP'},
      {id: 0x1_28, name: 'NPS_GET_MINI_USER_LIST'},
      {id: 0x2_07, name: 'NPS_ACK'},
      {id: 0x2_17, name: 'NPS_HEATBEAT'},
      {id: 0x2_29, name: 'NPS_MINI_USER_LIST'},
      {id: 0x3_0C, name: 'NPS_SEND_MINI_RIFF_LIST'},
      {id: 0x5_01, name: 'NPS_USER_LOGIN'},
      {id: 0x5_03, name: 'NPS_REGISTER_GAME_LOGIN'},
      {id: 0x5_07, name: 'NPS_NEW_GAME_ACCOUNT'},
      {id: 0x5_32, name: 'NPS_GET_PERSONA_MAPS'},
      {id: 0x6_07, name: 'NPS_GAME_ACCOUNT_INFO'},
      {id: 0x11_01, name: 'NPS_CRYPTO_DES_CBC'},
    ];

    this.loginServer = new LoginServer(this.database);
    this.personaServer = new PersonaServer();
    this.lobbyServer = new LobbyServer();
    this.serviceName = 'mcoserver:NPSPacketManager';
  }

  /**
   *
   * @param {number} msgId
   * @return {string}
   */
  msgCodetoName(messageId) {
    const mapping = this.msgNameMapping.find(code => code.id === messageId);
    return mapping ? mapping.name : 'Unknown msgId';
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
   * @returns {void}
   */
  setNPSKey(key) {
    this.npsKey = key;
  }

  /**
   *
   * @param {module:IRawPacket} rawPacket
   * @returns {Promise<ConnectionObj>}
   */
  async processNPSPacket(rawPacket) {
    const messageId = rawPacket.data.readInt16BE(0);
    log(
      `Handling message',
      ${{msgName: this.msgCodetoName(messageId), msgId: messageId}}`, {service: this.serviceName},
    );

    const {localPort} = rawPacket;

    switch (localPort) {
      case 8226:
        return this.loginServer.dataHandler(rawPacket, this.config.serverConfig);
      case 8228:
        return this.personaServer.dataHandler(rawPacket);
      case 7003:
        return this.lobbyServer.dataHandler(rawPacket);
      default:
        process.exitCode = -1;
        throw new Error(
          `[npsPacketManager] Recieved a packet',
          ${{
    msgId: messageId,
    localPort,
  }}`,
        );
    }
  }
}
