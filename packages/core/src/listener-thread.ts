// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from "@drazisil/mco-logger";
import { createServer, Server, Socket } from "net";
import {
  UnprocessedPacket,
  ITCPConnection,
  IConnectionManager,
  IListenerThread,
} from "@mco-server/types";

const { log } = Logger.getInstance();

export class ListenerThread implements IListenerThread {
  static _instance: IListenerThread;
  serviceName = "mcoserver:ListenerThread";

  static getInstance(): IListenerThread {
    if (!ListenerThread._instance) {
      ListenerThread._instance = new ListenerThread();
    }
    return ListenerThread._instance;
  }

  private constructor() {
    // Intentually empty
  }

  /**
   * The onData handler
   * takes the data buffer and creates a IRawPacket object
   */
  async _onData(data: Buffer, connection: ITCPConnection): Promise<void> {
    const { localPort, remoteAddress } = connection.sock;
    const rawPacket: UnprocessedPacket = {
      connectionId: connection.id,
      connection,
      data,
      localPort,
      remoteAddress,
      timestamp: Date.now(),
    };
    // Dump the raw packet
    log(
      "debug",
      `rawPacket's data prior to proccessing, { data: ${rawPacket.data.toString(
        "hex"
      )}}`,
      { service: "mcoserver:ListenerThread" }
    );
    let newConnection: ITCPConnection;
    try {
      newConnection = await connection.processPacket(rawPacket);
    } catch (error) {
      if (error instanceof Error) {
        const newError = new Error(
          `There was an error processing the packet: ${error.message}`
        );
        log("error", newError.message, { service: this.serviceName });
        throw newError;
      }
      throw error;
    }

    if (!connection.remoteAddress) {
      throw new Error(`Remote address is empty: ${connection.toString()}`);
    }

    try {
      await connection.updateConnectionByAddressAndPort(
        connection.remoteAddress,
        connection.localPort,
        newConnection
      );
    } catch (error) {
      if (error instanceof Error) {
        const newError = new Error(
          `There was an error updating the connection: ${error.message}`
        );
        log("error", newError.message, { service: this.serviceName });
        throw newError;
      }
      throw error;
    }
  }

  /**
   * Server listener method
   *
   * @param {Socket} socket
   * @param {ConnectionMgr} connectionMgr
   * @return {void}
   */
  _listener(socket: Socket, connectionMgr: IConnectionManager): void {
    // Received a new connection
    // Turn it into a connection object
    const connection = connectionMgr.findOrNewConnection(socket);

    const { localPort, remoteAddress } = socket;
    log("info", `Client ${remoteAddress} connected to port ${localPort}`, {
      service: "mcoserver:ListenerThread",
    });
    if (socket.localPort === 7003 && connection.inQueue) {
      /**
       * Debug seems hard-coded to use the connection queue
       * Craft a packet that tells the client it's allowed to login
       */

      // socket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]))
      connection.inQueue = false;
    }

    socket.on("end", () => {
      log(
        "info",
        `Client ${remoteAddress} disconnected from port ${localPort}`,
        {
          service: "mcoserver:ListenerThread",
        }
      );
    });
    socket.on("data", (data) => {
      this._onData(data, connection);
    });
    socket.on("error", (error) => {
      if (!error.message.includes("ECONNRESET")) {
        throw new Error(`Socket error: ${error}`);
      }
    });
  }

  /**
   * Given a port and a connection manager object,
   * create a new TCP socket listener for that port
   *
   */
  async startTCPListener(
    localPort: number,
    connectionMgr: IConnectionManager
  ): Promise<Server> {
    return createServer((socket) => {
      this._listener(socket, connectionMgr);
    }).listen({ port: localPort, host: "0.0.0.0" });
  }
}
