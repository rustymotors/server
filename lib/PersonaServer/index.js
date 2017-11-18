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

function npsSelectGamePersona(socket, rawData) {
  // Create the packet content
  const packetcontent = crypto.randomBytes(44971);

  // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetcontent);

  // Build the packet
  // Response Code
  // 207 = success
  // packetresult = packet.buildPacket(44975, 0x0207, packetcontent)
  const packetresult = packet.buildPacket(261, 0x0207, packetcontent);

  return packetresult;
}

function npsLogoutGameUser(socket, data) {
  logger.info("Logging out persona...");

  util.dumpRequest(socket, data);

  // Create the packet content
  const packetcontent = crypto.randomBytes(253);

  // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetcontent);

  // Build the packet
  const packetresult = packet.buildPacket(257, 0x0612, packetcontent);

  util.dumpResponse(packetresult, 16);
  return packetresult;
}

function npsGetPersonaMapsByCustomerId(customerId) {
  const name = Buffer.alloc(30);
  switch (customerId.readUInt32BE()) {
    case 2868969472:
      Buffer.from("Doc", "utf8").copy(name);
      return {
        personacount: Buffer.from([0x00, 0x01]),
        // Max Personas are how many there are not how many allowed
        maxpersonas: Buffer.from([0x01]),
        id: Buffer.from([0x00, 0x00, 0x00, 0x01]),
        name,
        shardid: Buffer.from([0x00, 0x00, 0x00, 0x2c]),
      };
    case 1:
      Buffer.from("Doctor Brown", "utf8").copy(name);
      return {
        personacount: Buffer.from([0x00, 0x01]),
        // Max Personas are how many there are not how many allowed
        maxpersonas: Buffer.from([0x01]),
        id: Buffer.from([0x00, 0x00, 0x00, 0x02]),
        name,
        shardid: Buffer.from([0x00, 0x00, 0x00, 0x2c]),
      };
    default:
      logger.error(`Unknown customerId: ${customerId.readUInt32BE()}`);
      process.exit(1);
      return null;
  }
}

function npsGetPersonaMaps(socket, data) {
  const customerId = Buffer.alloc(4);
  data.copy(customerId, 0, 12);
  const persona = npsGetPersonaMapsByCustomerId(customerId);

  // Create the packet content
  // packetcontent = crypto.randomBytes(1024)
  const packetcontent = packet.premadePersonaMaps();

  // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetcontent);

  // This is the persona count
  persona.personacount.copy(packetcontent, 10);

  // This is the max persona count (confirmed - debug)
  persona.maxpersonas.copy(packetcontent, 15);

  // PersonaId
  persona.id.copy(packetcontent, 18);

  // Shard ID
  persona.shardid.copy(packetcontent, 22);

  // Persona Name = 30-bit null terminated string
  persona.name.copy(packetcontent, 32);

  // Build the packet
  const packetresult = packet.buildPacket(1024, 0x0607, packetcontent);

  return packetresult;
}

function npsValidatePersonaName(session, rawData) {
  util.dumpRequest(session.personaSocket, rawData);

  const customerId = Buffer.alloc(4);
  rawData.copy(customerId, 0, 12);
  const persona = npsGetPersonaMapsByCustomerId(customerId);

  // Create the packet content
  const packetcontent = crypto.randomBytes(1024);

  // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetcontent);

  // This is the persona count
  persona.personacount.copy(packetcontent, 10);

  // This is the max persona count
  persona.maxpersonas.copy(packetcontent, 18);

  // PersonaId
  persona.id.copy(packetcontent, 18);

  // Shard ID
  persona.shardid.copy(packetcontent, 22);

  // Persona Name = 30-bit null terminated string
  persona.name.copy(packetcontent, 32);

  // Build the packet
  const packetresult = packet.buildPacket(1024, 0x0601, packetcontent);

  util.dumpResponse(packetresult, 1024);
  return packetresult;
}

function npsCheckToken(session, rawData) {
  util.dumpRequest(session.personaSocket, rawData);

  // Create the packet content
  const packetcontent = crypto.randomBytes(1024);

  // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetcontent);

  // Build the packet
  const packetresult = packet.buildPacket(1024, 0x0207, packetcontent);

  util.dumpResponse(packetresult, 1024);
  return packetresult;
}

function npsGetPersonaInfoByName(session, rawData) {
  util.dumpRequest(session.personaSocket, rawData);
  const personaName = Buffer.alloc(rawData.length - 30);
  rawData.copy(personaName, 0, 30);

  logger.debug(`personaName ${personaName}`);

  // Create the packet content
  const packetcontent = crypto.randomBytes(44976);

  // This is needed, not sure for what
  Buffer.from([0x01, 0x01]).copy(packetcontent);

  // Build the packet
  const packetresult = packet.buildPacket(48380, 0x0601, packetcontent);

  util.dumpResponse(packetresult, 16);
  return packetresult;
}

function personaDataHandler(socket, rawData) {
  const requestCode = getRequestCode(rawData);

  switch (requestCode) {
    // npsSelectGamePersona
    case "0503": {
      const packetresult = npsSelectGamePersona(socket, rawData);
      socket.write(packetresult);
      break;
    }
    // npsLogoutGameUser
    case "050F": {
      const p = npsLogoutGameUser(socket, rawData);
      // s.loggedIntoLobby = false;
      socket.write(p);
      break;
    }
    // npsGetPersonaMaps
    case "0532": {
      const packetresult = npsGetPersonaMaps(socket, rawData);
      socket.write(packetresult);
      break;
    }
    // npsValidatePersonaName
    case "0533": {
      const packetresult = npsValidatePersonaName(socket, rawData);
      socket.write(packetresult);
      break;
    }
    // NPSCheckToken
    case "0534": {
      const packetresult = npsCheckToken(socket, rawData);
      socket.write(packetresult);
      break;
    }
    // NPSGetPersonaInfoByName
    case "0519": {
      const packetresult = npsGetPersonaInfoByName(socket, rawData);
      socket.write(packetresult);

      // Response Code
      // 607 = persona name not available
      // 611 = No error, starter car lot
      // 602 = No error, starter car lot
      break;
    }
    default:
      util.dumpRequest(socket, rawData);
      console.error(`Unknown code ${requestCode} was recieved on port 8228`);
      process.exit(1);
  }
}

module.exports = { personaDataHandler };
