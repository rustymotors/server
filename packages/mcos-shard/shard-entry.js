// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

/**
 * @class
 * @property {string} name
 * @property {string} description
 * @property {number} id
 * @property {string} loginServerIp
 * @property {number} loginServerPort
 * @property {string} lobbyServerIp
 * @property {number} lobbyServerPort
 * @property {string} mcotsServerIp
 * @property {number} statusId
 * @property {string} statusReason
 * @property {string} serverGroupName
 * @property {number} population
 * @property {number} maxPersonasPerUser
 * @property {string} diagnosticServerHost
 * @property {number} diagnosticServerPort
 */
export class ShardEntry {
  name
  description
  id
  loginServerIp
  loginServerPort
  lobbyServerIp
  lobbyServerPort
  mcotsServerIp
  statusId
  statusReason
  serverGroupName
  population
  maxPersonasPerUser
  diagnosticServerHost
  diagnosticServerPort
  /**
     *
     * @param {string} name
     * @param {string} description
     * @param {number} id
     * @param {string} loginServerIp
     * @param {number} loginServerPort
     * @param {string} lobbyServerIp
     * @param {number} lobbyServerPort
     * @param {string} mcotsServerIp
     * @param {number} statusId
     * @param {string} statusReason
     * @param {string} serverGroupName
     * @param {number} population
     * @param {number} maxPersonasPerUser
     * @param {string} diagnosticServerHost
     * @param {number} diagnosticServerPort
     */
  constructor (
    name,
    description,
    id,
    loginServerIp,
    loginServerPort,
    lobbyServerIp,
    lobbyServerPort,
    mcotsServerIp,
    statusId,
    statusReason,
    serverGroupName,
    population,
    maxPersonasPerUser,
    diagnosticServerHost,
    diagnosticServerPort
  ) {
    this.name = name
    this.description = description
    this.id = id
    this.loginServerIp = loginServerIp
    this.loginServerPort = loginServerPort
    this.lobbyServerIp = lobbyServerIp
    this.lobbyServerPort = lobbyServerPort
    this.mcotsServerIp = mcotsServerIp
    this.statusId = statusId
    this.statusReason = statusReason
    this.serverGroupName = serverGroupName
    this.population = population
    this.maxPersonasPerUser = maxPersonasPerUser
    this.diagnosticServerHost = diagnosticServerHost
    this.diagnosticServerPort = diagnosticServerPort
  }

  /**
     * Return the entry in a formatted string
     *
     * @return {string}
     */
  formatForShardList () {
    return `[${this.name}]
      Description=${this.description}
      ShardId=${this.id}
      LoginServerIP=${this.loginServerIp}
      LoginServerPort=${this.loginServerPort}
      LobbyServerIP=${this.lobbyServerIp}
      LobbyServerPort=${this.lobbyServerPort}
      MCOTSServerIP=${this.mcotsServerIp}
      StatusId=${this.statusId}
      Status_Reason=${this.statusReason}
      ServerGroup_Name=${this.serverGroupName}
      Population=${this.population}
      MaxPersonasPerUser=${this.maxPersonasPerUser}
      DiagnosticServerHost=${this.diagnosticServerHost}
      DiagnosticServerPort=${this.diagnosticServerPort}`
  }
}
