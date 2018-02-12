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

import * as crypto from 'crypto';
import { logger } from '../../src/logger';
import * as packet from '../../src/packet';

/**
 * Handle a select game persona packet
 * @param {Socket} socket
 * @param {Buffer} rawData
 */
function npsSelectGamePersona(socket) {
  // Create the packet content
  // TODO: Create a real response, instead of a random blob of bytes
  const packetContent = crypto.randomBytes(44971);

  // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetContent);

  // Build the packet
  // Response Code
  // 207 = success
  const packetResult = packet.buildPacket(261, 0x0207, packetContent);

  socket.write(packetResult);
}

/**
 * Mark a persona as logged out
 * TODO: Change the persona record to show logged out.
 *   This requires it to exist first, it is currently hard-coded
 * TODO: Locate the connection and delete, or reset it.
 * @param {Socket} socket
 * @param {Buffer} data
 */
async function npsLogoutGameUser(socket) {
  logger.info('Logging out persona...');

  // Create the packet content
  // FIXME: Make a real packet, not a random blob of bytes
  const packetContent = crypto.randomBytes(253);

  // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetContent);

  // Build the packet
  const packetResult = packet.buildPacket(257, 0x0612, packetContent);

  socket.write(packetResult);
}

/**
 * Lookup all personas owned by the customer id
 * TODO: Store in a database, instead of being hard-coded
 * @param {Int} customerId
 */
function npsGetPersonaMapsByCustomerId(customerId) {
  const name = Buffer.alloc(30);

  switch (customerId.readUInt32BE()) {
    case 2868969472:
      Buffer.from('Doc', 'utf8').copy(name);
      return {
        id: Buffer.from([0x00, 0x00, 0x00, 0x01]),
        // Max Personas are how many there are not how many allowed
        maxPersonas: Buffer.from([0x01]),
        name,
        personaCount: Buffer.from([0x00, 0x01]),
        shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c]),
      };
    case 1:
      Buffer.from('Doctor Brown', 'utf8').copy(name);
      return {
        id: Buffer.from([0x00, 0x00, 0x00, 0x02]),
        // Max Personas are how many there are not how many allowed
        maxPersonas: Buffer.from([0x01]),
        name,
        personaCount: Buffer.from([0x00, 0x01]),
        shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c]),
      };
    default:
      logger.error(`Unknown customerId: ${customerId.readUInt32BE()}`);
      process.exit(1);
      return null;
  }
}

/**
 * Handle a get persona maps packet
 * @param {Socket} socket
 * @param {Buffer} data
 */
function npsGetPersonaMaps(socket, data) {
  const customerId = Buffer.alloc(4);
  data.copy(customerId, 0, 12);
  const persona = npsGetPersonaMapsByCustomerId(customerId);

  // Create the packet content
  // TODO: Create a real personas map packet, instead of using a fake one that (mostly) works
  const packetContent = packet.premadePersonaMaps();

  // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetContent);

  // This is the persona count
  persona.personaCount.copy(packetContent, 10);

  // This is the max persona count (confirmed - debug)
  persona.maxPersonas.copy(packetContent, 15);

  // PersonaId
  persona.id.copy(packetContent, 18);

  // Shard ID
  persona.shardId.copy(packetContent, 22);

  // Persona Name = 30-bit null terminated string
  persona.name.copy(packetContent, 32);

  // Build the packet
  const packetResult = packet.buildPacket(1024, 0x0607, packetContent);

  socket.write(packetResult);
}

/**
 * Route an incoming persona packet to the connect handler
 * TODO: See if this can be handled by a MessageNode
 * @param {Socket} socket
 * @param {Buffer} rawData
 */
export async function personaDataHandler(rawPacket) {
  const { connection, data } = rawPacket;
  const { sock } = connection;
  const requestCode = data.readUInt16BE().toString(16);

  if (requestCode === '503') {
    await npsSelectGamePersona(sock);
    return connection;
  }

  if (requestCode === '50f') {
    await npsLogoutGameUser(sock);
    return connection;
  }

  if (requestCode === '532') {
    await npsGetPersonaMaps(sock, data);
    return connection;
  }
  logger.error(`Unknown code ${requestCode} was received on port 8228`);
  process.exit(1);
  return null;
}
