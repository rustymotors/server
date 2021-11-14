// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { pino: P } = require("pino");
const { createServer } = require("net");

const log = P().child({ service: "mcos:ListenerThread" });
log.level = process.env["LOG_LEVEL"] || "info";

class ListenerThread {
  /** @type {ListenerThread} */
  static _instance;

  /**
   *
   * @returns {ListenerThread}
   */
  static getInstance() {
    if (!ListenerThread._instance) {
      ListenerThread._instance = new ListenerThread();
    }
    return ListenerThread._instance;
  }

  /** @private */
  constructor() {
    // Intentually empty
  }

  /**
   * The onData handler
   * takes the data buffer and creates a IRawPacket object
   * @param {Buffer} data
   * @param {import("./tcpConnection").TCPConnection} connection
   * @param {import("./connection-mgr.js").ConnectionManager} connectionManager
   * @param {import("../../login/src/index").LoginServer} loginServer
   * @param {import("../../persona/src/index").PersonaServer} personaServer
   * @param {import("../../lobby/src/index").LobbyServer} lobbyServer
   * @param {import("../../transactions/src/index").MCOTServer} mcotServer
   * @param {import("../../database/src/index").DatabaseManager} databaseManager
   * @returns {Promise<void>}
   */
  async _onData(
    data,
    connection,
    connectionManager,
    loginServer,
    personaServer,
    lobbyServer,
    mcotServer,
    databaseManager
  ) {
    const { localPort, remoteAddress } = connection.sock;
    /** @type {import("../../transactions/src/types").UnprocessedPacket} */
    const rawPacket = {
      connectionId: connection.id,
      connection,
      data,
      localPort,
      remoteAddress,
      timestamp: Date.now(),
    };
    // Dump the raw packet
    log.debug(
      `rawPacket's data prior to proccessing, { data: ${rawPacket.data.toString(
        "hex"
      )}}`
    );
    /** @type {import("./tcpConnection").TCPConnection} */
    let newConnection;
    try {
      newConnection = await connection.processPacket(
        rawPacket,
        connectionManager,
        loginServer,
        personaServer,
        lobbyServer,
        mcotServer,
        databaseManager
      );
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
      await connectionManager.updateConnectionByAddressAndPort(
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
   * @private
   * @param {import("net").Socket} socket
   * @param {import("./connection-mgr").ConnectionManager} connectionManager
   * @param {import("../../login/src/index").LoginServer} loginServer
   * @param {import("../../persona/src/index").PersonaServer} personaServer
   * @param {import("../../lobby/src/index").LobbyServer} lobbyServer
   * @param {import("../../transactions/src/index").MCOTServer} mcotServer
   * @param {import("../../database/src/index").DatabaseManager} databaseManager
   */
  _listener(
    socket,
    connectionManager,
    loginServer,
    personaServer,
    lobbyServer,
    mcotServer,
    databaseManager
  ) {
    // Received a new connection
    // Turn it into a connection object
    const connection = connectionManager.findOrNewConnection(socket);

    const { localPort, remoteAddress } = socket;
    log.info(`Client ${remoteAddress} connected to port ${localPort}`);
    if (socket.localPort === 7003 && connection.inQueue) {
      /**
       * Debug seems hard-coded to use the connection queue
       * Craft a packet that tells the client it's allowed to login
       */

      // socket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]))
      connection.inQueue = false;
    }

    socket.on("end", () => {
      log.info(`Client ${remoteAddress} disconnected from port ${localPort}`);
    });
    socket.on("data", (data) => {
      this._onData(
        data,
        connection,
        connectionManager,
        loginServer,
        personaServer,
        lobbyServer,
        mcotServer,
        databaseManager
      );
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
   * @param {number} localPort
   * @param {import("./connection-mgr").ConnectionManager} connectionManager
   * @param {import("../../login/src/index").LoginServer} loginServer
   * @param {import("../../persona/src/index").PersonaServer} personaServer
   * @param {import("../../lobby/src/index").LobbyServer} lobbyServer
   * @param {import("../../transactions/src/index").MCOTServer} mcotServer
   * @param {import("../../database/src/index").DatabaseManager} databaseManager
   * @returns {Promise<import("net").Server>}
   */
  async startTCPListener(
    localPort,
    connectionManager,
    loginServer,
    personaServer,
    lobbyServer,
    mcotServer,
    databaseManager
  ) {
    log.debug(`Attempting to bind to port ${localPort}`);
    return createServer((socket) => {
      this._listener(
        socket,
        connectionManager,
        loginServer,
        personaServer,
        lobbyServer,
        mcotServer,
        databaseManager
      );
    }).listen({ port: localPort, host: "0.0.0.0" });
  }
}
module.exports = { ListenerThread };
