// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

export class ShardEntry {
  public name: string;
  public description: string;
  public id: number;
  public loginServerIp: string;
  public loginServerPort: number;
  public lobbyServerIp: string;
  public lobbyServerPort: number;
  public mcotsServerIp: string;
  public statusID: number;
  public statusReason: string;
  public serverGroupName: string;
  public population: number;
  public maxPersonasPerUser: number;
  public diagnosticServerHost: string;
  public diagnosticServerPort: number;

  constructor(
    name: string,
    description: string,
    id: number,
    loginServerIp: string,
    loginServerPort: number,
    lobbyServerIp: string,
    lobbyServerPort: number,
    mcotsServerIp: string,
    statusID: number,
    statusReason: string,
    serverGroupName: string,
    population: number,
    maxPersonasPerUser: number,
    diagnosticServerHost: string,
    diagnosticServerPort: number
  ) {
    this.name = name;
    this.description = description;
    this.id = id;
    this.loginServerIp = loginServerIp;
    this.loginServerPort = loginServerPort;
    this.lobbyServerIp = lobbyServerIp;
    this.lobbyServerPort = lobbyServerPort;
    this.mcotsServerIp = mcotsServerIp;
    this.statusID = statusID;
    this.statusReason = statusReason;
    this.serverGroupName = serverGroupName;
    this.population = population;
    this.maxPersonasPerUser = maxPersonasPerUser;
    this.diagnosticServerHost = diagnosticServerHost;
    this.diagnosticServerPort = diagnosticServerPort;
  }

  public formatForShardList() {
    return `[${this.name}]
    Description=${this.description}
    ShardId=${this.id}
    LoginServerIP=${this.loginServerIp}
    LoginServerPort=${this.loginServerPort}
    LobbyServerIP=${this.lobbyServerIp}
    LobbyServerPort=${this.lobbyServerPort}
    MCOTSServerIP=${this.mcotsServerIp}
    StatusId=${this.statusID}
    Status_Reason=${this.statusReason}
    ServerGroup_Name=${this.serverGroupName}
    Population=${this.population}
    MaxPersonasPerUser=${this.maxPersonasPerUser}
    DiagnosticServerHost=${this.diagnosticServerHost}
    DiagnosticServerPort=${this.diagnosticServerPort}`;
  }
}
