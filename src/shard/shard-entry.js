"use strict";
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
exports.__esModule = true;
exports.ShardEntry = void 0;
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
var ShardEntry = /** @class */ (function () {
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
    function ShardEntry(name, description, id, loginServerIp, loginServerPort, lobbyServerIp, lobbyServerPort, mcotsServerIp, statusId, statusReason, serverGroupName, population, maxPersonasPerUser, diagnosticServerHost, diagnosticServerPort) {
        this.name = name;
        this.description = description;
        this.id = id;
        this.loginServerIp = loginServerIp;
        this.loginServerPort = loginServerPort;
        this.lobbyServerIp = lobbyServerIp;
        this.lobbyServerPort = lobbyServerPort;
        this.mcotsServerIp = mcotsServerIp;
        this.statusId = statusId;
        this.statusReason = statusReason;
        this.serverGroupName = serverGroupName;
        this.population = population;
        this.maxPersonasPerUser = maxPersonasPerUser;
        this.diagnosticServerHost = diagnosticServerHost;
        this.diagnosticServerPort = diagnosticServerPort;
    }
    /**
     *
     * @return {string}
     */
    ShardEntry.prototype.formatForShardList = function () {
        return "[".concat(this.name, "]\n    Description=").concat(this.description, "\n    ShardId=").concat(this.id, "\n    LoginServerIP=").concat(this.loginServerIp, "\n    LoginServerPort=").concat(this.loginServerPort, "\n    LobbyServerIP=").concat(this.lobbyServerIp, "\n    LobbyServerPort=").concat(this.lobbyServerPort, "\n    MCOTSServerIP=").concat(this.mcotsServerIp, "\n    StatusId=").concat(this.statusId, "\n    Status_Reason=").concat(this.statusReason, "\n    ServerGroup_Name=").concat(this.serverGroupName, "\n    Population=").concat(this.population, "\n    MaxPersonasPerUser=").concat(this.maxPersonasPerUser, "\n    DiagnosticServerHost=").concat(this.diagnosticServerHost, "\n    DiagnosticServerPort=").concat(this.diagnosticServerPort);
    };
    return ShardEntry;
}());
exports.ShardEntry = ShardEntry;
