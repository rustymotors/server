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

const crypto = require("crypto");
const net = require("net");
const util = require("../../src/nps_utils.js");
const logger = require("../../src/logger.js");
const packet = require("../../src/packet.js");

function getRequestCode(rawBuffer) {
  return `${util.toHex(rawBuffer[0])}${util.toHex(rawBuffer[1])}`;
}

/**
 * Handle a select game persona packet
 * @param {Socket} socket 
 * @param {Buffer} rawData 
 */
function npsSelectGamePersona(socket, rawData) {
  // Create the packet content
  // TODO: Create a real response, instead of a random blob of bytes
  const packetContent = crypto.randomBytes(44971);

  // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetContent);

  // Build the packet
  // Response Code
  // 207 = success
  const packetResult = packet.buildPacket(261, 0x0207, packetContent);

  return packetResult;
}

/**
 * Mark a persona as logged out
 * TODO: Change the persona record to show logged out. This requires it to exist first, it is currently hard-coded
 * @param {Socket} socket 
 * @param {Buffer} data 
 */
function npsLogoutGameUser(socket, data) {
  logger.info("Logging out persona...");

  util.dumpRequest(socket, data);

  // Create the packet content
  // FIXME: Make a real packet, not a random blob of bytes
  const packetContent = crypto.randomBytes(253);

  // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetContent);

  // Build the packet
  const packetResult = packet.buildPacket(257, 0x0612, packetContent);

  util.dumpResponse(packetResult, 16);
  return packetResult;
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
      Buffer.from("Doc", "utf8").copy(name);
      return {
        personaCount: Buffer.from([0x00, 0x01]),
        // Max Personas are how many there are not how many allowed
        maxPersonas: Buffer.from([0x01]),
        id: Buffer.from([0x00, 0x00, 0x00, 0x01]),
        name,
        shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c]),
      };
    case 1:
      Buffer.from("Doctor Brown", "utf8").copy(name);
      return {
        personaCount: Buffer.from([0x00, 0x01]),
        // Max Personas are how many there are not how many allowed
        maxPersonas: Buffer.from([0x01]),
        id: Buffer.from([0x00, 0x00, 0x00, 0x02]),
        name,
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

  return packetResult;
}

/**
 * Validate that a persona name is allowed?
 * FIXME: This is used in persona creation (possibly only by the debug client). It is likely broken as I no longer use sessions in this way
 * @param {*} session 
 * @param {*} rawData 
 */
function npsValidatePersonaName(session, rawData) {
  util.dumpRequest(session.personaSocket, rawData);

  const customerId = Buffer.alloc(4);
  rawData.copy(customerId, 0, 12);
  const persona = npsGetPersonaMapsByCustomerId(customerId);

  // Create the packet content
  // TODO: Creaft a real response packet, instead of a blob of random bytes
  const packetContent = crypto.randomBytes(1024);

  // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetContent);

  // This is the persona count
  persona.personaCount.copy(packetContent, 10);

  // This is the max persona count
  persona.maxPersonas.copy(packetContent, 18);

  // PersonaId
  persona.id.copy(packetContent, 18);

  // Shard ID
  persona.shardId.copy(packetContent, 22);

  // Persona Name = 30-bit null terminated string
  persona.name.copy(packetContent, 32);

  // Build the packet
  const packetResult = packet.buildPacket(1024, 0x0601, packetContent);

  util.dumpResponse(packetResult, 1024);
  return packetResult;
}

/**
 * Check if a token (licence plate) is allowed or in use?
 * FIXME: This is used by the debug client. It is likely broken as I no longer use sessions in this way
 * @param {*} session 
 * @param {*} rawData 
 */
function npsCheckToken(session, rawData) {
  util.dumpRequest(session.personaSocket, rawData);

  // Create the packet content
  // TODO: Create a real response, instead of a random blo of bytes
  const packetContent = crypto.randomBytes(1024);

  // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetContent);

  // Build the packet
  const packetResult = packet.buildPacket(1024, 0x0207, packetContent);

  util.dumpResponse(packetResult, 1024);
  return packetResult;
}

/**
 * Lookup a persona by name
 * FIXME: This is for the debug client. It's likely broken, since I no longer use sessions in this way
 * @param {*} session 
 * @param {*} rawData 
 */
function npsGetPersonaInfoByName(session, rawData) {
  util.dumpRequest(session.personaSocket, rawData);
  const personaName = Buffer.alloc(rawData.length - 30);
  rawData.copy(personaName, 0, 30);

  logger.debug(`personaName ${personaName}`);

  // Create the packet content
  // TODO: Creft a real response, instead of a random blob of bytes
  const packetContent = crypto.randomBytes(44976);

  // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetContent);

  // Build the packet
  const packetResult = packet.buildPacket(48380, 0x0601, packetContent);

  util.dumpResponse(packetResult, 16);
  return packetResult;
}

/**
 * Route an incoming persona packet to the connect handler
 * TODO: See if this can be handled by a MessageNode
 * @param {Socket} socket 
 * @param {Buffer} rawData 
 */
function personaDataHandler(socket, rawData) {
  const requestCode = getRequestCode(rawData);

  switch (requestCode) {
    // npsSelectGamePersona
    case "0503": {
      const packetResult = npsSelectGamePersona(socket, rawData);
      socket.write(packetResult);
      break;
    }
    // npsLogoutGameUser
    case "050F": {
      const p = npsLogoutGameUser(socket, rawData);
      socket.write(p);
      break;
    }
    // npsGetPersonaMaps
    case "0532": {
      const packetResult = npsGetPersonaMaps(socket, rawData);
      socket.write(packetResult);
      break;
    }
    // npsValidatePersonaName
    case "0533": {
      const packetResult = npsValidatePersonaName(socket, rawData);
      socket.write(packetResult);
      break;
    }
    // NPSCheckToken
    case "0534": {
      const packetResult = npsCheckToken(socket, rawData);
      socket.write(packetResult);
      break;
    }
    // NPSGetPersonaInfoByName
    case "0519": {
      const packetResult = npsGetPersonaInfoByName(socket, rawData);
      socket.write(packetResult);

      // Response Code
      // 607 = persona name not available
      // 611 = No error, starter car lot
      // 602 = No error, starter car lot
      break;
    }
    default:
      util.dumpRequest(socket, rawData);
      console.error(`Unknown code ${requestCode} was received on port 8228`);
      process.exit(1);
  }
}

module.exports = { personaDataHandler };
