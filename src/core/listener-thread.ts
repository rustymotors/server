// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import type { Server, Socket } from "net";
import { createServer } from "net";
import { logger } from "../logger/index.js";
import type { UnprocessedPacket } from "../types/index.js";
import { ConnectionManager } from "./connection-mgr.js";
import { TCPConnection } from "./tcpConnection.js";

const log = logger.child({ service: "mcoserver:ListenerThread" });

/**
 * Handles all incomming TCP connections
 * @class
 */
export class ListenerThread {
  private static _instance: ListenerThread;
/**
 * Get the single instamce of the connection listener
 *
 * @static
 * @return {*}  {ListenerThread}
 * @memberof ListenerThread
 */
static getInstance(): ListenerThread {
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
  private async _onData(
    data: Buffer,
    connection: TCPConnection
  ): Promise<void> {
    const rawPacket: UnprocessedPacket = {
      connectionId: connection.id,
      connection,
      data,
      timestamp: Date.now(),
    };
    // Dump the raw packet
    log.debug(
      `rawPacket's data prior to proccessing, { data: ${rawPacket.data.toString(
        "hex"
      )}}`
    );
    let newConnection: TCPConnection | null = null;
    try {
      newConnection = await connection.processPacket(rawPacket);
    } catch (error) {
      if (error instanceof Error) {
        const newError = new Error(
          `There was an error processing the packet: ${error.message}`
        );
        log.error(newError.message);
        throw newError;
      }
      throw error;
    }

    if (!connection.remoteAddress) {
      throw new Error(`Remote address is empty: ${connection.toString()}`);
    }

    try {
      connection.updateConnectionByAddressAndPort(
        connection.remoteAddress,
        connection.localPort,
        newConnection
      );
    } catch (error) {
      if (error instanceof Error) {
        const newError = new Error(
          `There was an error updating the connection: ${error.message}`
        );
        log.error(newError.message);
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
  private _listener(socket: Socket, connectionMgr: ConnectionManager): void {
    // Received a new connection
    // Turn it into a connection object
    const connectionRecord = connectionMgr.findOrNewConnection(socket);

    if (connectionRecord === null) {
      log.fatal("Unable to attach the socket to a connection.");
      return;
    }

    const { localPort, remoteAddress } = socket;
    log.info(`Client ${remoteAddress} connected to port ${localPort}`);
    if (socket.localPort === 7003 && connectionRecord.inQueue) {
      /**
       * Debug seems hard-coded to use the connection queue
       * Craft a packet that tells the client it's allowed to login
       */

      socket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]));
      connectionRecord.inQueue = false;
    }

    socket.on("end", () => {
      log.info(`Client ${remoteAddress} disconnected from port ${localPort}`);
    });
    socket.on("data", (data) => {
      void this._onData(data, connectionRecord);
    });
    socket.on("error", (error: Error) => {
      if (!error.message.includes("ECONNRESET")) {
        throw new Error(`Socket error: ${error.message}`);
      }
    });
  }

  /**
   * Given a port and a connection manager object,
   * create a new TCP socket listener for that port
   *
   */
  startTCPListener(localPort: number): Server {
    log.debug(`Attempting to bind to port ${localPort}`);
    return createServer((socket) => {
      this._listener(socket, ConnectionManager.getConnectionManager());
    }).listen({ port: localPort, host: "0.0.0.0" });
  }
}
