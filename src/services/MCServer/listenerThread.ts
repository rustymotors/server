// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as net from "net";
import { ConnectionObj } from "./ConnectionObj";
import ConnectionMgr from "./connectionMgr";
import { IRawPacket } from "./IRawPacket";

// import { sendPacketOkLogin } from "./MCOTS/TCPManager";

import * as SDC from "statsd-client";
import { IServerConfiguration, ConfigManager } from "../shared/configManager";
import { Logger } from "../shared/loggerManager";

export class ListenerThread {
  public config = new ConfigManager().getConfig();
  public sdc = new SDC({ host: this.config.statsDHost });
  public logger = new Logger().getLogger("ListenerThread");

  /**
   * the onData handler
   * takes the data buffer and creates a IRawPacket object
   *
   * @param {Buffer} data
   * @param {ConnectionObj} connection
   * @param {IServerConfiguration} config
   */
  public async _onData(
    data: Buffer,
    connection: ConnectionObj,
    config: IServerConfiguration
  ) {
    try {
      const { localPort, remoteAddress } = connection.sock;
      const rawPacket: IRawPacket = {
        connectionId: connection.id,
        connection,
        data,
        localPort,
        remoteAddress,
        timestamp: Date.now(),
      };
      // Dump the raw packet
      this.logger.info(
        `[listenerThread] rawPacket's data prior to proccessing: ${rawPacket.data.toString(
          "hex"
        )}`
      );
      const startPacketHandleTime = new Date();
      const newConnection = await connection.mgr.processData(rawPacket, config);
      this.sdc.timing("packet.tcp.process_time", startPacketHandleTime);
      if (!connection.remoteAddress) {
        this.logger.fatal({ connection }, "Remote address is empty");
        process.exit(-1);
      }
      await connection.mgr._updateConnectionByAddressAndPort(
        connection.remoteAddress!,
        connection.localPort,
        newConnection
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * server listener method
   *
   * @param {net.Socket} socket
   * @param {ConnectionMgr} connectionMgr
   * @param {IServerConfiguration} config
   * @memberof ListenerThread
   */
  public _listener(
    socket: net.Socket,
    connectionMgr: ConnectionMgr,
    config: IServerConfiguration
  ) {
    // Received a new connection
    // Turn it into a connection object
    const connection = connectionMgr.findOrNewConnection(socket);

    const { localPort, remoteAddress } = socket;
    this.logger.info(
      `[listenerThread] Client ${remoteAddress} connected to port ${localPort}`
    );
    if (socket.localPort === 7003 && connection.inQueue) {
      /**
       * Debug seems hard-coded to use the connection queue
       * Craft a packet that tells the client it's allowed to login
       */

      socket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]));
      connection.inQueue = false;
    }
    socket.on("end", () => {
      this.logger.info(
        `[listenerThread] Client ${remoteAddress} disconnected from port ${localPort}`
      );
    });
    socket.on("data", data => {
      this._onData(data, connection, config);
    });
    socket.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code !== "ECONNRESET") {
        this.logger.error(err);
      }
    });
  }

  /**
   * Given a port and a connection manager object,
   * create a new TCP socket listener for that port
   *
   * @export
   * @param {number} localPort
   * @param {ConnectionMgr} connectionMgr
   * @param {IServerConfiguration} config
   */
  public async startTCPListener(
    localPort: number,
    connectionMgr: ConnectionMgr,
    config: IServerConfiguration
  ) {
    net
      .createServer(socket => {
        this._listener(socket, connectionMgr, config);
      })
      .listen({ port: localPort, host: "0.0.0.0" });
  }
}
