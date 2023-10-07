// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

export class ShardEntry {
    name: string;
    description: string;
    id: number;
    loginServerIp: string;
    loginServerPort: number;
    lobbyServerIp: string;
    lobbyServerPort: number;
    mcotsServerIp: string;
    statusId: number;
    statusReason: string;
    serverGroupName: string;
    population: number;
    maxPersonasPerUser: number;
    diagnosticServerHost: string;
    diagnosticServerPort: number;
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
    constructor(
        name: string,
        description: string,
        id: number,
        loginServerIp: string,
        loginServerPort: number,
        lobbyServerIp: string,
        lobbyServerPort: number,
        mcotsServerIp: string,
        statusId: number,
        statusReason: string,
        serverGroupName: string,
        population: number,
        maxPersonasPerUser: number,
        diagnosticServerHost: string,
        diagnosticServerPort: number,
    ) {
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
     * Return the entry in a formatted string
     *
     * @return {string}
     */
    formatForShardList(): string {
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
      DiagnosticServerPort=${this.diagnosticServerPort}`;
    }
}
