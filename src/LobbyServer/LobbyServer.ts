// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as assert from "assert";
import { Socket } from "net";
import { Connection } from "../Connection";
import { pool } from "../database";
import { IRawPacket } from "../IRawPacket";
import { Logger } from "../logger";
import { NPSMsg } from "../messageTypes/NPSMsg";
import { NPSUserInfo } from "../messageTypes/npsUserInfo";
import { PersonaServer } from "../PersonaServer/PersonaServer";

const logger = new Logger().getLogger();

async function npsSocketWriteIfOpen(conn: Connection, buffer: Buffer) {
  const sock = conn.sock;
  if (sock.writable) {
    // Write the packet to socket
    sock.write(buffer);
  } else {
    throw new Error(
      `[Lobby] Error writing ${buffer.toString("hex")} to ${
        sock.remoteAddress
      } , ${sock.localPort.toString()}`
    );
  }
  return conn;
}

/**
 * Handle a request to connect to a game server packet
 * @param {Socket} socket
 * @param {Buffer} rawData
 */
export async function _npsRequestGameConnectServer(
  connection: Connection,
  rawData: Buffer
) {
  const { sock } = connection;
  logger.debug("*** _npsRequestGameConnectServer ****");
  logger.debug(`Packet from ${sock.remoteAddress}`);
  logger.debug(`Packet as hex: ${rawData.toString("hex")}`);
  logger.debug("************************************");

  // // Load the received data into a MsgPack class
  // const msgPack = MsgPack(rawData);

  // Return a _NPS_UserInfo structure
  const userInfo = new NPSUserInfo(rawData);
  userInfo.dumpInfo();

  const personaManager = new PersonaServer();

  const customerId = personaManager._getPersonasById(userInfo.userId)
    .customerId;

  // Set the encryption keys on the lobby connection
  const keys = await fetchSessionKeyByCustomerId(customerId);
  assert(keys);
  const s = connection;

  // Create the cypher and decipher only if not already set
  if (!s.encLobby.decipher) {
    try {
      s.setEncryptionKeyDES(keys.s_key);
    } catch (error) {
      throw new Error(`[Lobby] Unable to set ${keys.s_key} from ${keys}`);
    }
  }

  const packetContent = Buffer.alloc(38);

  // MsgLen
  Buffer.from([0x00, 0x04]).copy(packetContent);

  // NPS_USERID - User ID - persona id - long
  Buffer.from([0x00, 0x00, 0x00, 0x02]).copy(packetContent, 2);

  // User name (32)
  const name = Buffer.alloc(32);
  Buffer.from("Doctor Brown", "utf8").copy(name);
  name.copy(packetContent, 6);

  // UserData - User controllable data (64)
  Buffer.alloc(64).copy(packetContent, 38);

  // Build the packet
  const packetResult = new NPSMsg();
  packetResult.msgNo = 0x120;
  packetResult.setContent(packetContent);
  packetResult.dumpPacket();
  // const packetResult = buildPacket(4, 0x0120, packetContent);

  return packetResult;
}

/**
 * Takes an encrypted command packet and returns the decrypted bytes
 * @param {Connection} con
 * @param {Buffer} cypherCmd
 */
function decryptCmd(con: Connection, cypherCmd: Buffer) {
  const s = con;
  const decryptedCommand = s.decipherBufferDES(cypherCmd);
  s.decryptedCmd = decryptedCommand;
  logger.warn(`[lobby] Enciphered Cmd: ${cypherCmd.toString("hex")}`);
  logger.warn(`[lobby] Deciphered Cmd: ${s.decryptedCmd.toString("hex")}`);
  return s;
}

/**
 * Takes an plaintext command packet and return the encrypted bytes
 * @param {Connection} con
 * @param {Buffer} cypherCmd
 */
function encryptCmd(con: Connection, cypherCmd: Buffer) {
  const s = con;
  s.encryptedCmd = s.cipherBufferDES(cypherCmd);
  return s;
}

/**
 * Fetch session key from database based on remote address
 * @param {string} remoteAddress
 */
async function fetchSessionKeyByConnectionId(connectionId: string) {
  logger.debug(connectionId);
  return pool
    .query("SELECT session_key, s_key FROM sessions WHERE connection_id = $1", [
      connectionId,
    ])
    .then(res => res.rows[0])
    .catch(e => {
      throw new Error(
        `[Lobby] Unable to fetch session key for connection id: ${connectionId}: ${e}`
      );
    });
}

async function fetchSessionKeyByCustomerId(customerId: number) {
  logger.debug(customerId.toString());
  return pool
    .query("SELECT session_key, s_key FROM sessions WHERE customer_id = $1", [
      customerId,
    ])
    .then(res => res.rows[0])
    .catch(e => {
      throw new Error(
        `[Lobby] Unable to fetch session key for customerId: ${customerId}: ${e}`
      );
    });
}

/**
 * Takes a plaintext command packet, encrypts it, and sends it across the connection's socket
 * @param {Connection} con
 * @param {Buffer} data
 */
export async function sendCommand(con: Connection, data: Buffer) {
  const { id } = con;
  const s = con;

  decryptCmd(s, Buffer.from(data.slice(4)));

  // Create the packet content
  const packetContent = Buffer.alloc(375);

  // Add the response code
  packetContent.writeUInt16BE(0x0219, 367);
  packetContent.writeUInt16BE(0x0101, 369);
  packetContent.writeUInt16BE(0x022c, 371);

  // Build the packet
  const packetResult = new NPSMsg();
  packetResult.msgNo = 0x229;
  packetResult.setContent(packetContent);
  packetResult.dumpPacket();
  // const packetResult = buildPacket(32, 0x0229, packetContent);

  const cmdEncrypted = encryptCmd(s, packetResult.getContentAsBuffer());

  cmdEncrypted.encryptedCmd = Buffer.concat([
    Buffer.from([0x11, 0x01]),
    cmdEncrypted.encryptedCmd,
  ]);

  return cmdEncrypted;
}

export class LobbyServer {
  public _npsHeartbeat() {
    const packetContent = Buffer.alloc(8);
    const packetResult = new NPSMsg();
    packetResult.msgNo = 0x127;
    packetResult.setContent(packetContent);
    packetResult.dumpPacket();
    // const packetResult = buildPacket(8, 0x0127, packetContent);
    return packetResult;
  }
  public async dataHandler(rawPacket: IRawPacket) {
    const { localPort, remoteAddress } = rawPacket;
    logger.info(`=============================================
    [Lobby] Received packet on port ${localPort} from ${remoteAddress}...`);
    logger.info("=============================================");
    const { connection, data } = rawPacket;
    const { sock } = connection;
    let updatedConnection = connection;
    const requestCode = data.readUInt16BE(0).toString(16);

    switch (requestCode) {
      // _npsRequestGameConnectServer
      case "100": {
        const responsePacket = await _npsRequestGameConnectServer(
          connection,
          data
        );
        logger.debug(
          `[Lobby/Connect] responsePacket's data prior to sending: ${responsePacket.getContentAsString()}`
        );
        npsSocketWriteIfOpen(connection, responsePacket.serialize());
        break;
      }
      // npsHeartbeat
      case "217": {
        const responsePacket = await this._npsHeartbeat();
        logger.debug(
          `[Lobby/Heartbeat] responsePacket's data prior to sending: ${responsePacket.getContentAsString()}`
        );
        npsSocketWriteIfOpen(connection, responsePacket.serialize());
        break;
      }
      // npsSendCommand
      case "1101": {
        // This is an encrypted command
        // Fetch session key

        updatedConnection = await sendCommand(connection, data);
        const { sock: newSock, encryptedCmd } = updatedConnection;

        if (encryptedCmd == null) {
          throw new Error(
            `[Lobby/CMD] Error with encrypted command, dumping connection...${updatedConnection}`
          );
        }

        logger.debug(
          `[Lobby/CMD] encrypedCommand's data prior to sending: ${encryptedCmd.toString(
            "hex"
          )}`
        );
        npsSocketWriteIfOpen(connection, encryptedCmd);
        break;
      }
      default:
        throw new Error(
          `[Lobby] Unknown code ${requestCode} was received on port 7003`
        );
    }
    return updatedConnection;
  }
}
