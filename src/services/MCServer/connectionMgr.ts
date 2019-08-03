// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Socket } from "net";
import { ConnectionObj } from "./ConnectionObj";
import { IRawPacket } from "./IRawPacket";

import { defaultHandler } from "./MCOTS/TCPManager";
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
    const npsPacketManager = new NPSPacketManager();

    const { remoteAddress, localPort, data } = rawPacket;

    // Log the packet as debug
    this.sdc.increment("packets.count");
    this.logger.info(
      {
        remoteAddress,
        localPort,
        data: data.toString("hex"),
      },
      "logging raw packet"
    );

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
      try {
        return npsPacketManager.processNPSPacket(rawPacket);
      } catch (error) {
        this.logger.error({ error }, `Error in connectionMgr::processData`);

        process.exit(-1);
      }
    }

    this.logger.info(`This is an MCOTS packet`);

    switch (localPort) {
      case 43300:
        return defaultHandler(rawPacket);
      default:
        // Is this a hacker?
        try {
          if (this.banList.indexOf(remoteAddress!) < 0) {
            // In ban list, skip
            return rawPacket.connection;
          }
        } catch (error) {
          this.logger.error({ error }, `Error checking ban list`);
          process.exit(-1);
        }
        // Unknown request, log it
        this.logger.warn(
          {
            localPort,
            remoteAddress,
            data: data.toString("hex"),
          },
          `[connectionMgr] No known handler for request, banning`
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
    newConnection: ConnectionObj
  ) {
    if (newConnection === undefined) {
      this.logger.fatal(
        {
          remoteAddress: address,
          localPort: port,
        },
        "Undefined connection"
      );
      process.exit(-1);
    }
    try {
      const index = this.connections.findIndex(
        (connection: ConnectionObj) =>
          connection.remoteAddress === address && connection.localPort === port
      );
      this.connections.splice(index, 1);
      this.connections.push(newConnection);
    } catch (error) {
      this.logger.error(
        { error, connections: this.connections },
        `Error updating connection`
      );
    }
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
      this.logger.fatal(
        {
          remoteAddress,
          localPort,
        },
        "No address in socket"
      );
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

  public resetAllQueueState() {
    this.connections = this.connections.map((connection: ConnectionObj) => {
      connection.inQueue = true;
      return connection;
    });
  }

  /**
   * Dump all connections for debugging
   */
  public dumpConnections() {
    return this.connections;
  }
}

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at:", p, "reason:", reason);
  console.trace();
  // application specific logging, throwing an error, or other logic here
});
