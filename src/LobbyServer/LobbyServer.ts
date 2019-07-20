// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as assert from "assert";
import { Connection } from "../Connection";
import { IRawPacket } from "../services/shared/interfaces/IRawPacket";
import { Logger } from "../services/shared/logger";
import { MSG_DIRECTION, NPSMsg } from "../services/shared/messageTypes/NPSMsg";
import { NPSUserInfo } from "../services/shared/messageTypes/npsUserInfo";
import { PersonaServer } from "../PersonaServer/PersonaServer";
import { NPSPacketManager } from "../npsPacketManager";
import { DatabaseManager } from "../databaseManager";

const loggers = new Logger().getLoggers();

const npsPacketManager = new NPSPacketManager(loggers);
const databaseManager = new DatabaseManager(loggers);

async function npsSocketWriteIfOpen(conn: Connection, buffer: Buffer) {
  const sock = conn.sock;
  if (sock.writable) {
    // Write the packet to socket
    sock.write(buffer);
  } else {
    throw new Error(
      `[Lobby] Error writing ${buffer.toString("hex")} to ${
        sock.remoteAddress
      } , ${sock}`
    );
  }
  return conn;
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
  // TODO: Don't output the enchiphered command once we know we are correctly deciphering it
  loggers.both.debug(`[lobby] Enciphered Cmd: ${cypherCmd.toString("hex")}`);
  loggers.both.debug(
    `[lobby] Deciphered Cmd: ${s.decryptedCmd.toString("hex")}`
  );
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
 * Takes a plaintext command packet, encrypts it, and sends it across the connection's socket
 * @param {Connection} con
 * @param {Buffer} data
 */
export async function sendCommand(con: Connection, data: Buffer) {
  const { id } = con;
  const s = con;

  const decipheredCommand = decryptCmd(s, Buffer.from(data.slice(4)))
    .decryptedCmd;

  // Marshal the command into an NPS packet
  const incommingRequest = new NPSMsg(MSG_DIRECTION.RECIEVED);
  incommingRequest.deserialize(decipheredCommand);

  loggers.both.debug(
    `Incomming NPS Command... [${npsPacketManager.msgCodetoName(
      incommingRequest.msgNo
    )}]`
  );
  incommingRequest.dumpPacket();

  // Create the packet content
  const packetContent = Buffer.alloc(375);

  // Add the response code
  packetContent.writeUInt16BE(0x0219, 367);
  packetContent.writeUInt16BE(0x0101, 369);
  packetContent.writeUInt16BE(0x022c, 371);

  loggers.both.warn(`Sending a dummy response of 0x229 - NPS_MINI_USER_LIST`);

  // Build the packet
  const packetResult = new NPSMsg(MSG_DIRECTION.SENT);
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
    const packetResult = new NPSMsg(MSG_DIRECTION.SENT);
    packetResult.msgNo = 0x127;
    packetResult.setContent(packetContent);
    packetResult.dumpPacket();
    // const packetResult = buildPacket(8, 0x0127, packetContent);
    return packetResult;
  }
  public async dataHandler(rawPacket: IRawPacket) {
    const { localPort, remoteAddress } = rawPacket;
    loggers.both.info(`=============================================
    [Lobby] Received packet on port ${localPort} from ${remoteAddress}...`);
    loggers.both.info("=============================================");
    const { connection, data } = rawPacket;
    const { sock } = connection;
    let updatedConnection = connection;
    const requestCode = data.readUInt16BE(0).toString(16);

    switch (requestCode) {
      // _npsRequestGameConnectServer
      case "100": {
        const responsePacket = await this._npsRequestGameConnectServer(
          connection,
          data
        );
        loggers.both.debug(
          `[Lobby/Connect] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
        );
        // TODO: Investigate why this crashes retail
        try {
          npsSocketWriteIfOpen(connection, responsePacket.serialize());
        } catch (error) {
          loggers.both.error(error);
        }
        break;
      }
      // npsHeartbeat
      case "217": {
        const responsePacket = await this._npsHeartbeat();
        loggers.both.debug(
          `[Lobby/Heartbeat] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
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

        loggers.both.debug(
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

  public _generateSessionKeyBuffer(key: string) {
    const nameBuffer = Buffer.alloc(64);
    Buffer.from(key, "utf8").copy(nameBuffer);
    return nameBuffer;
  }

  /**
   * Handle a request to connect to a game server packet
   * @param {Socket} socket
   * @param {Buffer} rawData
   */
  public async _npsRequestGameConnectServer(
    connection: Connection,
    rawData: Buffer
  ) {
    const { sock } = connection;
    loggers.both.debug("*** _npsRequestGameConnectServer ***");
    loggers.both.debug(`Packet from ${sock.remoteAddress}`);
    loggers.both.debug(`Packet as hex: ${rawData.toString("hex")}`);
    loggers.both.debug("************************************");

    // // Load the received data into a MsgPack class
    // const msgPack = MsgPack(rawData);

    // Return a _NPS_UserInfo structure
    const userInfo = new NPSUserInfo(MSG_DIRECTION.RECIEVED, loggers);
    userInfo.deserialize(rawData);
    userInfo.dumpInfo();

    const personaManager = new PersonaServer();

    const personas = personaManager._getPersonasById(userInfo.userId);
    if (personas.length === 0) {
      throw new Error("No personas found.");
    }
    const customerId = personas[0].customerId;

    // Set the encryption keys on the lobby connection
    const keys = await databaseManager.fetchSessionKeyByCustomerId(customerId);
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

    const packetContent = Buffer.alloc(72);
    // const packetContent = Buffer.alloc(38);

    // this response is a NPS_UserStatus

    // Ban and Gag
    // Buffer.from([0x00]).copy(packetContent);
    // Buffer.from([0x00, 0x00]).copy(packetContent);

    // NPS_USERID - User ID - persona id - long
    Buffer.from([0x00, 0x84, 0x5f, 0xed]).copy(packetContent);

    // SessionKeyStr (32)
    this._generateSessionKeyBuffer(keys.session_key).copy(packetContent, 4);

    // // SessionKeyLen - int
    packetContent.writeInt16BE(32, 66);

    // // User name (32)
    // const name = Buffer.alloc(32);
    // Buffer.from("Doctor Brown", "utf8").copy(name);
    // name.copy(packetContent, 6);

    // // UserData - User controllable data (64)
    // Buffer.alloc(64).copy(packetContent, 38);

    // Build the packet
    const packetResult = new NPSMsg(MSG_DIRECTION.SENT);
    packetResult.msgNo = 0x120;
    packetResult.setContent(packetContent);
    packetResult.dumpPacket();

    return packetResult;
  }
}
