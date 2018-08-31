// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Socket } from "net";
import { IRawPacket } from "../IRawPacket";
import { logger } from "../logger";
import { NPSMsg } from "../messageTypes/NPSMsg";
import { buildPacket, premadePersonaMaps } from "../packet";

/**
 * Handle a select game persona packet
 * @param {Socket} socket
 * @param {Buffer} rawData
 */
async function _npsSelectGamePersona(socket: Socket) {
  // Create the packet content
  // TODO: Create a real response, instead of a random blob of bytes
  const packetContent = Buffer.alloc(251);

  // Build the packet
  // Response Code
  // 207 = success
  const responsePacket = new NPSMsg();
  responsePacket.msgNo = 0x207;
  responsePacket.setContent(packetContent);
  responsePacket.dumpPacket();
  // const responsePacket = buildPacket(261, 0x0207, packetContent);

  logger.debug(
    `[npsSelectGamePersona] responsePacket's data prior to sending: ${responsePacket.getContentAsString()}`
  );
  socket.write(responsePacket.serialize());
}

async function _npsNewGameAccount(sock: Socket) {
  const rPacket = new NPSMsg();
  rPacket.msgNo = 0x601;
  rPacket.dumpPacket();

  sock.write(rPacket.serialize());
}

/**
 * Mark a persona as logged out
 * TODO: Change the persona record to show logged out.
 *   This requires it to exist first, it is currently hard-coded
 * TODO: Locate the connection and delete, or reset it.
 * @param {Socket} socket
 * @param {Buffer} data
 */
async function _npsLogoutGameUser(socket: Socket) {
  logger.info("[personaServer] Logging out persona...");

  // Create the packet content
  // FIXME: Make a real packet, not a random blob of bytes
  const packetContent = Buffer.alloc(253);

  // This is needed, not sure for what
  // Buffer.from([0x01, 0x01]).copy(packetContent);

  // Build the packet
  const responsePacket = new NPSMsg();
  responsePacket.msgNo = 0x612;
  responsePacket.setContent(packetContent);
  responsePacket.dumpPacket();
  // const responsePacket = buildPacket(257, 0x0612, packetContent);

  logger.debug(
    `[npsLogoutGameUser] responsePacket's data prior to sending: ${responsePacket.getContentAsString()}`
  );
  socket.write(responsePacket.serialize());
}

/**
 * Lookup all personas owned by the customer id
 * TODO: Store in a database, instead of being hard-coded
 * @param {Int} customerId
 */
async function _npsGetPersonaMapsByCustomerId(customerId: number) {
  const name = Buffer.alloc(30);

  switch (customerId) {
    case 2868969472:
      Buffer.from("Doc", "utf8").copy(name);
      return {
        id: Buffer.from([0x00, 0x00, 0x00, 0x01]),
        // Max Personas are how many there are not how many allowed
        maxPersonas: Buffer.from([0x01]),
        name,
        personaCount: Buffer.from([0x00, 0x01]),
        shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c]),
      };
    case 1:
      Buffer.from("Doctor Brown", "utf8").copy(name);
      return {
        id: Buffer.from([0x00, 0x00, 0x00, 0x02]),
        // Max Personas are how many there are not how many allowed
        maxPersonas: Buffer.from([0x02]),
        name,
        personaCount: Buffer.from([0x00, 0x01]),
        shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c]),
      };
    default:
      logger.error(
        `[personaServer/npsGetPersonaMapsByCustomerId] Unknown customerId: ${customerId}`
      );
      process.exit(1);
  }
}

/**
 * Handle a get persona maps packet
 * @param {Socket} socket
 * @param {Buffer} data
 */
async function _npsGetPersonaMaps(socket: Socket, data: Buffer) {
  const customerId = Buffer.alloc(4);
  data.copy(customerId, 0, 12);
  logger.info(
    `npsGetPersonaMaps for custometId: ${customerId.readUInt32BE(0)}`
  );
  const persona = await _npsGetPersonaMapsByCustomerId(
    customerId.readUInt32BE(0)
  );

  if (persona === undefined) {
    throw new Error("persona undefined in npsGetPersonaMaps");
  } else {
    // Create the packet content
    // TODO: Create a real personas map packet, instead of using a fake one that (mostly) works
    // const packetContent = premadePersonaMaps();
    const packetContent = Buffer.alloc(68);

    // This is the remaining packet length after the msgNo
    // Buffer.from([0x00, 0x44]).copy(packetContent);

    // This is the persona count
    persona.personaCount.copy(packetContent, 8);

    // This is the max persona count (confirmed - debug)
    persona.maxPersonas.copy(packetContent, 13);

    // PersonaId
    persona.id.copy(packetContent, 16);

    // Shard ID
    persona.shardId.copy(packetContent, 20);

    // No clue
    // Buffer.from([0x6c, 0x78, 0x0a, 0x0d]).copy(packetContent, 28);
    Buffer.from([0x0a, 0x0d]).copy(packetContent, 28);

    // Persona Name = 30-bit null terminated string
    persona.name.copy(packetContent, 30);

    // Build the packet
    const responsePacket = new NPSMsg();
    responsePacket.msgNo = 0x607;
    responsePacket.setContent(packetContent.slice(0, 68));
    responsePacket.dumpPacket();
    // const responsePacket = buildPacket(68, 0x0607, packetContent);

    logger.debug(
      `[npsGetPersonaMaps] responsePacket's data prior to sending: ${responsePacket.getContentAsString()}`
    );

    socket.write(responsePacket.serialize());
  }
}

/**
 * Handle a get persona maps packet
 * @param {Socket} socket
 * @param {Buffer} data
 */
async function _npsCheckToken(socket: Socket, data: Buffer) {
  const customerId = data.readInt32BE(12);
  const requestedPersonaName = data
    .slice(18, data.lastIndexOf(0x00))
    .toString();
  const serviceName = data.slice(data.indexOf(0x0a) + 1).toString();
  logger.warn(`customerId: ${customerId}`);
  logger.warn(`Requested persona name: ${requestedPersonaName}`);
  logger.warn(`Service name: ${serviceName}`);

  // const persona = npsGetPersonaMapsByCustomerId(customerId);

  // Create the packet content
  // TODO: Create a real personas map packet, instead of using a fake one that (mostly) works

  // This is needed, not sure for what
  const packetContent = premadePersonaMaps();
  // Buffer.from([0x01, 0x01]).copy(packetContent);

  // Build the packet
  // NPS_ACK = 207
  const responsePacket = new NPSMsg();
  responsePacket.msgNo = 0x207;
  responsePacket.setContent(packetContent);
  responsePacket.dumpPacket();
  // const responsePacket = buildPacket(1024, 0x0207, packetContent);

  logger.debug(
    `[npsCheckToken] responsePacket's data prior to sending: ${responsePacket.getContentAsString()}`
  );
  socket.write(responsePacket.serialize());
}

/**
 * Handle a get persona maps packet
 * @param {Socket} socket
 * @param {Buffer} data
 */
async function _npsValidatePersonaName(socket: Socket, data: Buffer) {
  const customerId = data.readInt32BE(12);
  const requestedPersonaName = data
    .slice(18, data.lastIndexOf(0x00))
    .toString();
  const serviceName = data.slice(data.indexOf(0x0a) + 1).toString();
  logger.warn(`customerId: ${customerId}`);
  logger.warn(`Requested persona name: ${requestedPersonaName}`);
  logger.warn(`Service name: ${serviceName}`);

  // const persona = npsGetPersonaMapsByCustomerId(customerId);

  // Create the packet content
  // TODO: Create a real personas map packet, instead of using a fake one that (mostly) works

  // This is needed, not sure for what
  const packetContent = premadePersonaMaps();
  // Buffer.from([0x01, 0x01]).copy(packetContent);

  // Build the packet
  // NPS_USER_VALID     validation succeeded
  const responsePacket = new NPSMsg();
  responsePacket.msgNo = 0x601;
  responsePacket.setContent(packetContent);
  responsePacket.dumpPacket();
  // const responsePacket = buildPacket(1024, 0x0601, packetContent);

  logger.debug(
    `[npsValidatePersonaName] responsePacket's data prior to sending: ${responsePacket.getContentAsString()}`
  );
  socket.write(responsePacket.serialize());
}

export class PersonaServer {
  /**
   * Route an incoming persona packet to the connect handler
   * @param {Socket} socket
   * @param {Buffer} rawData
   */
  public async dataHandler(rawPacket: IRawPacket) {
    const { connection, data, localPort, remoteAddress } = rawPacket;
    const { sock } = connection;
    logger.info(`=============================================
    Received packet on port ${localPort} from ${remoteAddress}...`);
    logger.info("=============================================");
    const requestCode = data.readUInt16BE(0).toString(16);

    switch (requestCode) {
      case "503":
        // NPS_REGISTER_GAME_LOGIN = 0x503
        await _npsSelectGamePersona(sock);
        return connection;

      case "507":
        // NPS_NEW_GAME_ACCOUNT == 0x507
        await _npsNewGameAccount(sock);
        return connection;

      case "50f":
        // NPS_REGISTER_GAME_LOGOUT = 0x50F
        await _npsLogoutGameUser(sock);
        return connection;
      case "532":
        // NPS_GET_PERSONA_MAPS = 0x532
        await _npsGetPersonaMaps(sock, data);
        return connection;
      case "533":
        // NPS_VALIDATE_PERSONA_NAME   = 0x533
        await _npsValidatePersonaName(sock, data);
        return connection;
      case "534":
        // NPS_CHECK_TOKEN   = 0x534
        await _npsCheckToken(sock, data);
        return connection;
      default:
        logger.error(
          `[personaServer] Unknown code ${requestCode} was received on port 8228`
        );
        process.exit(1);
        return null;
    }
  }
}
