// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Socket } from "net";
import { ConnectionObj } from "./ConnectionObj";
import { IRawPacket } from "./IRawPacket";

import { defaultHandler } from "./TCPManager";
import { NPSPacketManager } from "./npsPacketManager";
import { DatabaseManager } from "../shared/databaseManager";

import * as SDC from "statsd-client";
import { Logger } from "../shared/loggerManager";
import { ConfigManager, IServerConfiguration } from "../shared/configManager";

export default class ConnectionMgr {
  public logger = new Logger().getLogger("ConnectionManager");
  public config = new ConfigManager().getConfig();
  public sdc: SDC;
  private connections: ConnectionObj[];
  private newConnectionId: number;
  private banList: string[] = [];

  constructor() {
    this.sdc = new SDC({ host: this.config.statsDHost });
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
    const database = new DatabaseManager();
    const npsPacketManager = new NPSPacketManager();

    const { remoteAddress, localPort, data } = rawPacket;

    // Log the packet as debug
    this.sdc.increment("packets.count");
    this.logger.info({
      message: "logging raw packet",
      remoteAddress,
      localPort,
      data: data.toString("hex"),
    });

    if (localPort === 8226 || localPort === 8228 || localPort === 7003) {
      this.logger.info(
        {
          msgName: npsPacketManager.msgCodetoName(
            rawPacket.data.readInt16BE(0)
          ),
          localPort,
        },
        `Recieved NPS packet`
      );
      return npsPacketManager.processNPSPacket(rawPacket);
    }

    switch (localPort) {
      case 43300:
        return defaultHandler(rawPacket);
      default:
        // Is this a hacker?
        if (this.banList.indexOf(remoteAddress!) < 0) {
          // In ban list, skip
          return rawPacket.connection;
        }
        // Unknown request, log it
        this.logger.warn({
          message: `[connectionMgr] No known handler for request, banning`,
          localPort,
          remoteAddress,
          data: data.toString("hex"),
        });
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
    newConnection: ConnectionObj
  ) {
    if (newConnection === undefined) {
      this.logger.fatal({
        message: "Undefined connection",
        remoteAddress: address,
        localPort: port,
      });
      process.exit(-1);
    }
    const index = this.connections.findIndex(
      (connection: ConnectionObj) =>
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
      this.logger.fatal({
        message: "No address in socket",
        remoteAddress,
        localPort,
      });
      process.exit(-1);
    }
    const con = this.findConnectionByAddressAndPort(remoteAddress!, localPort);
    if (con !== undefined) {
      this.logger.info(
        `[connectionMgr] I have seen connections from ${remoteAddress} on ${localPort} before`
      );
      con.sock = socket;
      return con;
    }

    const newConnection = new ConnectionObj(
      `${Date.now().toString()}_${this.newConnectionId}`,
      socket,
      this
    );
    this.logger.info(
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
