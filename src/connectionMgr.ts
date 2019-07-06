// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Socket } from "net";
import { Connection } from "./Connection";
import { IRawPacket } from "./services/shared/interfaces/IRawPacket";
import { IServerConfiguration } from "./services/shared/interfaces/IServerConfiguration";
import { LobbyServer } from "./LobbyServer/LobbyServer";
import { ILoggers } from "./services/shared/logger";
import { LoginServer } from "./LoginServer/LoginServer";
import { PersonaServer } from "./PersonaServer/PersonaServer";
import { defaultHandler } from "./TCPManager";
import { loggers } from "winston";

const personaServer = new PersonaServer();
const lobbyServer = new LobbyServer();

export default class ConnectionMgr {
  public loggers: ILoggers;
  private connections: Connection[];
  private newConnectionId: number;
  private banList: string[] = [];

  constructor(loggers: ILoggers) {
    if (!loggers) {
      throw new Error("No loggers in constructor");
    }
    this.loggers = loggers;
    this.connections = [];
    this.newConnectionId = 1;
  }

  /**
   * Check incoming data and route it to the correct handler based on localPort
   * @param {String} id
   * @param {Buffer} data
   */
  public async processData(
    rawPacket: IRawPacket,
    config: IServerConfiguration
  ) {
    const loginServer = new LoginServer(this.loggers);

    const { remoteAddress, localPort, data } = rawPacket;

    // Log the packet as debug
    this.loggers.file.debug({
      msg: "logging raw packet",
      remoteAddress,
      localPort,
      data: data.toString("hex"),
    });

    switch (localPort) {
      case 8226:
        return loginServer.dataHandler(rawPacket, config);
      case 8228:
        return personaServer.dataHandler(rawPacket);
      case 7003:
        return lobbyServer.dataHandler(rawPacket);
      case 43300:
        return defaultHandler(rawPacket);
      default:
        // Is this a hacker?
        if (this.banList.indexOf(remoteAddress!) < 0) {
          // In ban list, skip
          return rawPacket.connection;
        }
        // Unknown request, log it
        this.loggers.both.debug(
          `[connectionMgr] No known handler for localPort ${localPort},
                unable to handle the request from ${remoteAddress} on localPort ${localPort}, aborting.
                [connectionMgr] Data was: ${data.toString("hex")}, banning.`
        );
        this.banList.push(remoteAddress!);
        return rawPacket.connection;
    }
  }

  public getBans() {
    return this.banList;
  }

  /**
   * Locate connection by remoteAddress and localPort in the connections array
   * @param {String} connectionId
   */
  public findConnectionByAddressAndPort(
    remoteAddress: string,
    localPort: number
  ) {
    const results = this.connections.find(connection => {
      const match =
        remoteAddress === connection.remoteAddress &&
        localPort === connection.localPort;
      return match;
    });
    return results;
  }

  /**
   * Locate connection by id in the connections array
   * @param {String} connectionId
   */
  public findConnectionById(connectionId: string) {
    const results = this.connections.find(connection => {
      const match = connectionId === connection.id;
      return match;
    });
    return results;
  }

  public async _updateConnectionByAddressAndPort(
    address: string,
    port: number,
    newConnection: Connection
  ) {
    if (newConnection === undefined) {
      throw new Error("Undefined connection");
    }
    const index = this.connections.findIndex(
      (connection: Connection) =>
        connection.remoteAddress === address && connection.localPort === port
    );
    this.connections.splice(index, 1);
    this.connections.push(newConnection);
  }

  /**
   * Return an existing connection, or a new one
   *
   * @param {Socket} socket
   * @returns
   * @memberof ConnectionMgr
   */
  public findOrNewConnection(socket: Socket) {
    const { remoteAddress, localPort } = socket;
    if (!remoteAddress) {
      this.loggers.both.error(socket);
      throw new Error("Remote address is empty");
    }
    const con = this.findConnectionByAddressAndPort(remoteAddress, localPort);
    if (con !== undefined) {
      this.loggers.both.info(
        `[connectionMgr] I have seen connections from ${remoteAddress} on ${localPort} before`
      );
      con.sock = socket;
      return con;
    }

    const newConnection = new Connection(
      `${Date.now().toString()}_${this.newConnectionId}`,
      socket,
      this
    );
    this.loggers.both.info(
      `[connectionMgr] I have not seen connections from ${remoteAddress} on ${localPort} before, adding it.`
    );
    this.connections.push(newConnection);
    return newConnection;
  }

  /**
   * Dump all connections for debugging
   */
  public dumpConnections() {
    return this.connections;
  }
}
