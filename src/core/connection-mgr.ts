// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { DatabaseManager } from "../database/index";
import { MessageNode } from "../message-types/index";
import {
  EMessageDirection,
  NPS_COMMANDS,
  UnprocessedPacket,
} from "../types/index";
import { Socket } from "net";
import { EncryptionManager } from "./encryption-mgr";
import { NPSPacketManager } from "./nps-packet-manager";
import { TCPConnection } from "./tcpConnection";
import { MCOTServer } from "../transactions";
import P from "pino";

const log = P().child({ service: "mcoserver:ConnectionMgr" });
log.level = process.env["LOG_LEVEL"] || "info";

export class ConnectionManager {
  private static _instance: ConnectionManager;
  databaseMgr: DatabaseManager;
  connections: TCPConnection[];
  newConnectionId: number;
  banList: string[];

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager._instance) {
      ConnectionManager._instance = new ConnectionManager();
    }
    return ConnectionManager._instance;
  }

  private constructor() {
    this.connections = [];
    this.newConnectionId = 1;
    /**
     * @type {string[]}
     */
    this.banList = [];
    this.databaseMgr = DatabaseManager.getInstance();
    this.databaseMgr.init();
  }

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

    const { remoteAddress, localPort, data } = rawPacket;

    // Log the packet as debug
    log.debug(
      `logging raw packet,
      ${JSON.stringify({
        remoteAddress,
        localPort,
        data: data.toString("hex"),
      })}`
    );

    switch (localPort) {
      case 8226:
      case 8228:
      case 7003: {
        try {
          const opCode = rawPacket.data.readInt16BE(0);
          const msgName1 = npsPacketManager.msgCodetoName(
            rawPacket.data.readInt16BE(0)
          );
          const msgName2 = this.getNameFromOpCode(
            rawPacket.data.readInt16BE(0)
          );
          log.debug(
            `Recieved NPS packet,
            ${JSON.stringify({
              opCode,
              msgName1,
              msgName2,
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
        log.debug(
          "Recieved MCOTS packet"

          // {
          //   opCode: rawPacket.data.readInt16BE(0),
          //   msgName: `${npsPacketManager.msgCodetoName(
          //     rawPacket.data.readInt16BE(0)
          //   )} / ${this.getNameFromOpCode(rawPacket.data.readInt16BE(0))}`,
          //   localPort
          // }
        );
        const newNode = new MessageNode(EMessageDirection.RECEIVED);
        newNode.deserialize(rawPacket.data);
        log.debug(JSON.stringify(newNode));

        return MCOTServer.getInstance().defaultHandler(rawPacket);
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
   * @return {module:ConnectionObj}
   */
  findConnectionByAddressAndPort(
    remoteAddress: string,
    localPort: number
  ): TCPConnection | undefined {
    return this.connections.find((connection) => {
      const match =
        remoteAddress === connection.remoteAddress &&
        localPort === connection.localPort;
      return match;
    });
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

  async _updateConnectionByAddressAndPort(
    address: string,
    port: number,
    newConnection: TCPConnection
  ): Promise<void> {
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
   */
  findOrNewConnection(socket: Socket): TCPConnection {
    const { remoteAddress, localPort } = socket;
    if (!remoteAddress) {
      throw new Error(
        `No address in socket: ${JSON.stringify({
          remoteAddress,
          localPort,
        })}`
      );
    }

    if (!localPort) {
      throw new Error(
        `No localPort in socket: ${JSON.stringify({
          remoteAddress,
          localPort,
        })}`
      );
    }

    const con = this.findConnectionByAddressAndPort(remoteAddress, localPort);
    if (con !== undefined) {
      log.info(
        `I have seen connections from ${remoteAddress} on ${localPort} before`
      );
      con.sock = socket;
      return con;
    }

    const newConnection = this.newConnection(
      `${Date.now().toString()}_${this.newConnectionId}`,
      socket
    );
    log.info(
      `I have not seen connections from ${remoteAddress} on ${localPort} before, adding it.`
    );
    this.connections.push(newConnection);
    return newConnection;
  }

  /**
   *
   * @return {void}
   */
  resetAllQueueState(): void {
    this.connections = this.connections.map((connection) => {
      connection.inQueue = true;
      return connection;
    });
  }

  /**
   * Dump all connections for debugging
   */
  dumpConnections(): TCPConnection[] {
    return this.connections;
  }
}
