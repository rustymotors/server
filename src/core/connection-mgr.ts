// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { MessageNode } from "../message-types/index.js";
import {
  EMessageDirection,
  NPS_COMMANDS,
  UnprocessedPacket,
} from "../types/index.js";
import type { Socket } from "net";
import { EncryptionManager } from "./encryption-mgr.js";
import { NPSPacketManager } from "./nps-packet-manager.js";
import { TCPConnection } from "./tcpConnection.js";
import { MCOTServer } from "../transactions/index.js";
import { logger } from "../logger/index.js";
import { isMCOT } from "../server/index.js";
import { wrapPacket } from "../server/packetFactory.js";
import { randomUUID } from "crypto";

const log = logger.child({
  service: "ConnectionManager",
});

/**
 * Manages the connection objects that connect the network sockets to server metadata
 * @class
 */
export class ConnectionManager {
  private static _instance: ConnectionManager;
  private connections: TCPConnection[] = [];
  private banList: string[] = [];

  public static getConnectionManager(this: void): ConnectionManager {
    if (!ConnectionManager._instance) {
      ConnectionManager._instance = new ConnectionManager();
    }
    return ConnectionManager._instance;
  }

  private constructor() {
    /**
     * @type {string[]}
     */
  }

  /**
   * Creates a new connection object for the socket and adds to list
   * @param {string} connectionId
   * @param {Socket} socket
   * @returns {TCPConnection}
   */
  newConnection(connectionId: string, socket: Socket): TCPConnection {
    const newConnection = new TCPConnection(connectionId, socket);
    newConnection.setManager(this);
    newConnection.setEncryptionManager(new EncryptionManager());
    return newConnection;
  }

  /**
   * Check incoming data and route it to the correct handler based on localPort
   */
  async processData(rawPacket: UnprocessedPacket): Promise<TCPConnection> {
    const npsPacketManager = new NPSPacketManager();

    const { data } = rawPacket;
    const { remoteAddress, localPort } = rawPacket.connection;

    // Log the packet as debug
    log.debug(
      `logging raw packet,
      ${JSON.stringify({
        remoteAddress,
        localPort,
        data: data.toString("hex"),
      })}`
    );

    let packetType = "tcp";

    if (isMCOT(rawPacket.data)) {
      packetType = "tomc";
    }

    log.debug(
      `Identified packet type as ${packetType} on port ${rawPacket.connection.localPort}`
    );

    log.debug("Attempting to wrap packet");
    await wrapPacket(rawPacket, packetType).processPacket();
    log.debug("Wrapping packet successful");

    if (localPort === 8226) {
      log.debug("Packet has requested the login server");
    }
    if (localPort === 8228) {
      log.debug("Packet has requested the persona server");
    }
    if (localPort === 7003) {
      log.debug("Packet has requested the lobby server");
    }
    if (localPort === 43300) {
      log.debug("Packet has requested the transactions server");
    }

    switch (localPort) {
      case 8226:
      case 8228:
      case 7003: {
        try {
          const opCode = rawPacket.data.readInt16BE(0);
          const msgName = this.getNameFromOpCode(rawPacket.data.readInt16BE(0));
          log.debug(
            `Recieved NPS packet,
            ${JSON.stringify({
              opCode,
              msgName,
              localPort,
            })}`
          );
        } catch (error) {
          if (error instanceof Error) {
            const newError = new Error(
              `Error in the recieved packet: ${error.message}`
            );
            log.error(newError.message);
            throw newError;
          }
          throw error;
        }
        try {
          return await npsPacketManager.processNPSPacket(rawPacket);
        } catch (error) {
          if (error instanceof Error) {
            const newError = new Error(
              `There was an error processing the data: ${error.message}`
            );
            log.error(newError.message);
            throw newError;
          }
          throw error;
        }
      }

      case 43_300: {
        log.debug("Recieved MCOTS packet");
        const newNode = new MessageNode(EMessageDirection.RECEIVED);
        newNode.deserialize(rawPacket.data);
        log.debug(JSON.stringify(newNode));

        return MCOTServer.getTransactionServer().defaultHandler(rawPacket);
      }

      default:
        log.debug(JSON.stringify(rawPacket));

        throw new Error(
          `We received a packet on port ${localPort}. We don't what to do yet, going to throw so the message isn't lost.`
        );
    }
  }

  /**
   * Get the name connected to the NPS opcode
   * @param {number} opCode
   * @return {string}
   */
  getNameFromOpCode(opCode: number): string {
    const opCodeName = NPS_COMMANDS.find((code) => code.value === opCode);
    if (opCodeName === undefined) {
      throw new Error(`Unable to locate name for opCode ${opCode}`);
    }

    return opCodeName.name;
  }

  /**
   * Get the name connected to the NPS opcode
   * @param {string} name
   * @return {number}
   */
  getOpcodeFromName(name: string): number {
    const opCode = NPS_COMMANDS.find((code) => code.name === name);
    if (opCode === undefined) {
      throw new Error(`Unable to locate opcode for name ${name}`);
    }

    return opCode.value;
  }

  /**
   *
   * @return {string[]}
   */
  getBans(): string[] {
    return this.banList;
  }

  /**
   * Locate connection by remoteAddress and localPort in the connections array
   * @param {string} remoteAddress
   * @param {number} localPort
   * @memberof ConnectionMgr
   * @return {TCPConnection || null}
   */
  findConnectionByAddressAndPort(
    remoteAddress: string,
    localPort: number
  ): TCPConnection | null {
    return (
      this.connections.find((connection) => {
        const match =
          remoteAddress === connection.remoteAddress &&
          localPort === connection.localPort;
        return match;
      }) || null
    );
  }

  /**
   * Locate connection by id in the connections array
   */
  findConnectionById(connectionId: string): TCPConnection {
    const results = this.connections.find(
      (connection) => connectionId === connection.id
    );
    if (results === undefined) {
      throw new Error(`Unable to locate connection for id ${connectionId}`);
    }

    return results;
  }

  _updateConnectionByAddressAndPort(
    address: string,
    port: number,
    newConnection: TCPConnection
  ): TCPConnection[] {
    if (newConnection === undefined) {
      throw new Error(
        `Undefined connection: ${JSON.stringify({
          remoteAddress: address,
          localPort: port,
        })}`
      );
    }

    try {
      const index = this.connections.findIndex(
        (connection) =>
          connection.remoteAddress === address && connection.localPort === port
      );
      this.connections.splice(index, 1);
      this.connections.push(newConnection);
      return this.connections;
    } catch (error) {
      process.exitCode = -1;
      throw new Error(
        `Error updating connection, ${JSON.stringify({
          error,
          connections: this.connections,
        })}`
      );
    }
  }

  /**
   * Return an existing connection, or a new one
   * @returns {TCPConnection}
   */
  findOrNewConnection(socket: Socket): TCPConnection | null {
    if (typeof socket.remoteAddress === "undefined") {
      log.fatal("The socket is missing a remoteAddress, unable to use.");
      return null;
    }

    if (typeof socket.localPort === "undefined") {
      log.fatal("The socket is missing a localPost, unable to use.");
      return null;
    }

    const existingConnection = this.findConnectionByAddressAndPort(
      socket.remoteAddress,
      socket.localPort
    );
    if (existingConnection) {
      log.info(
        `I have seen connections from ${socket.remoteAddress} on ${socket.localPort} before`
      );
      existingConnection.sock = socket;
      log.debug("Returning found connection after attaching socket");
      return existingConnection;
    }

    const newConnectionId = randomUUID();
    log.debug(`Creating new connection with id ${newConnectionId}`);
    const newConnection = this.newConnection(newConnectionId, socket);
    log.info(
      `I have not seen connections from ${socket.remoteAddress} on ${socket.localPort} before, adding it.`
    );
    const updatedConnectionList = this.addConnection(newConnection);
    log.debug(
      `Connection with id of ${newConnection.id} has been added. The connection list now contains ${updatedConnectionList.length} connections.`
    );
    return newConnection;
  }

  addConnection(connection: TCPConnection): TCPConnection[] {
    this.connections.push(connection);
    return this.connections;
  }

  /**
   * Places all connection into the queue
   * @return {TCPConnection[]}
   */
  returnAllConnectionsToQueue(): TCPConnection[] {
    this.connections = this.connections.map((connection) => {
      connection.inQueue = true;
      return connection;
    });
    return this.connections;
  }

  /**
   * Resets the connections list
   * @returns {TCPConnection[]}
   */
  clearConnectionList(): TCPConnection[] {
    this.connections = [];
    return this.connections;
  }

  /**
   * Dump all connections for debugging
   */
  fetchConnectionList(): TCPConnection[] {
    return this.connections;
  }
}

/**
 * Return the ConnectionManager class instance
 * @returns {ConnectionManager}
 */
export function getConnectionManager(): ConnectionManager {
  return ConnectionManager.getConnectionManager();
}
