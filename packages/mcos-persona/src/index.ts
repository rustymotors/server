// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { logger } from "mcos-logger/src/index.js";
import { handleData, personaRecords } from "./internal.js";
import type { Socket } from "node:net";
import { NPSMessage } from "./NPSMessage.js";
import type {
  BufferWithConnection,
  GServiceResponse,
  PersonaRecord,
} from "mcos-types/types.js";
import { NPSPersonaMapsMessage } from "./NPSPersonaMapsMessage.js";

const log = logger.child({ service: "mcoserver:PersonaServer" });

/**
 *
 *
 * @param {unknown} error
 * @return {string}
 */
function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Selects a game persona and marks it as in use
 * @param {NPSMessage} requestPacket
 * @returns {Promise<NPSMessage>}
 */
export async function handleSelectGamePersona(
  requestPacket: NPSMessage
): Promise<NPSMessage> {
  log.debug("_npsSelectGamePersona...");
  log.debug(
    `NPSMsg request object from _npsSelectGamePersona: ${JSON.stringify({
      NPSMsg: requestPacket.toJSON(),
    })}`
  );

  requestPacket.dumpPacket();

  // Create the packet content
  const packetContent = Buffer.alloc(251);

  // Build the packet
  // Response Code
  // 207 = success
  const responsePacket = new NPSMessage("sent");
  responsePacket.msgNo = 0x2_07;
  responsePacket.setContent(packetContent);
  log.debug(
    `NPSMsg response object from _npsSelectGamePersona',
    ${JSON.stringify({
      NPSMsg: responsePacket.toJSON(),
    })}`
  );

  responsePacket.dumpPacket();

  log.debug(
    `[npsSelectGamePersona] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
  );
  return Promise.resolve(responsePacket);
}

/**
 * Please use {@link PersonaServer.getInstance()}
 * @classdesc
 * @property {IPersonaRecord[]} personaList
 */
export class PersonaServer {
  /**
   *
   *
   * @static
   * @type {PersonaServer}
   * @memberof PersonaServer
   */
  static _instance: PersonaServer;

  /**
   * Return the instance of the Persona Server class
   * @returns {PersonaServer}
   */
  static getInstance(): PersonaServer {
    if (typeof PersonaServer._instance === "undefined") {
      PersonaServer._instance = new PersonaServer();
    }
    return PersonaServer._instance;
  }

  /**
   * Create a new game persona record
   *
   * @param {Buffer} data
   * @return {Promise<NPSMessage>}
   * @memberof PersonaServer
   */
  async createNewGameAccount(data: Buffer): Promise<NPSMessage> {
    const requestPacket = new NPSMessage("recieved").deserialize(data);
    log.debug(
      `NPSMsg request object from _npsNewGameAccount',
      ${JSON.stringify({
        NPSMsg: requestPacket.toJSON(),
      })}`
    );

    requestPacket.dumpPacket();

    const rPacket = new NPSMessage("sent");
    rPacket.msgNo = 0x6_01;
    log.debug(
      `NPSMsg response object from _npsNewGameAccount',
      ${JSON.stringify({
        NPSMsg: rPacket.toJSON(),
      })}`
    );

    rPacket.dumpPacket();

    return Promise.resolve(rPacket);
  }

  //  TODO: #1227 Change the persona record to show logged out. This requires it to exist first, it is currently hard-coded
  //  TODO: #1228 Locate the connection and delete, or reset it.
  /**
   * Log out a game persona
   *
   * @param {Buffer} data
   * @return {Promise<NPSMessage>}
   * @memberof PersonaServer
   */
  async logoutGameUser(data: Buffer): Promise<NPSMessage> {
    log.debug("[personaServer] Logging out persona...");
    const requestPacket = new NPSMessage("recieved").deserialize(data);
    log.debug(
      `NPSMsg request object from _npsLogoutGameUser',
      ${JSON.stringify({
        NPSMsg: requestPacket.toJSON(),
      })}`
    );

    requestPacket.dumpPacket();

    // Create the packet content
    const packetContent = Buffer.alloc(257);

    // Build the packet
    const responsePacket = new NPSMessage("sent");
    responsePacket.msgNo = 0x6_12;
    responsePacket.setContent(packetContent);
    log.debug(
      `NPSMsg response object from _npsLogoutGameUser',
      ${JSON.stringify({
        NPSMsg: responsePacket.toJSON(),
      })}`
    );

    responsePacket.dumpPacket();

    log.debug(
      `[npsLogoutGameUser] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
    );
    return Promise.resolve(responsePacket);
  }

  /**
   * Handle a check token packet
   *
   * @param {Buffer} data
   * @return {Promise<NPSMessage>}
   * @memberof PersonaServer
   */
  async validateLicencePlate(data: Buffer): Promise<NPSMessage> {
    log.debug("_npsCheckToken...");
    const requestPacket = new NPSMessage("recieved").deserialize(data);
    log.debug(
      `NPSMsg request object from _npsCheckToken',
      ${JSON.stringify({
        NPSMsg: requestPacket.toJSON(),
      })}`
    );

    requestPacket.dumpPacket();

    const customerId = data.readInt32BE(12);
    const plateName = data.subarray(17).toString();
    log.debug(`customerId: ${customerId}`); // skipcq: JS-0378
    log.debug(`Plate name: ${plateName}`); // skipcq: JS-0378

    // Create the packet content

    const packetContent = Buffer.alloc(256);

    // Build the packet
    // NPS_ACK = 207
    const responsePacket = new NPSMessage("sent");
    responsePacket.msgNo = 0x2_07;
    responsePacket.setContent(packetContent);
    log.debug(
      `NPSMsg response object from _npsCheckToken',
      ${JSON.stringify({
        NPSMsg: responsePacket.toJSON(),
      })}`
    );
    responsePacket.dumpPacket();

    log.debug(
      `[npsCheckToken] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
    );
    return Promise.resolve(responsePacket);
  }

  /**
   * Handle a get persona maps packet
   *
   * @param {Buffer} data
   * @return {Promise<NPSMessage>}
   */
  async validatePersonaName(data: Buffer): Promise<NPSMessage> {
    log.debug("_npsValidatePersonaName...");
    const requestPacket = new NPSMessage("recieved").deserialize(data);

    log.debug(
      `NPSMsg request object from _npsValidatePersonaName',
      ${JSON.stringify({
        NPSMsg: requestPacket.toJSON(),
      })}`
    );
    requestPacket.dumpPacket();

    const customerId = data.readInt32BE(12);
    const requestedPersonaName = data
      .subarray(18, data.lastIndexOf(0x00))
      .toString();
    const serviceName = data.subarray(data.indexOf(0x0a) + 1).toString(); // skipcq: JS-0377
    log.debug(
      JSON.stringify({ customerId, requestedPersonaName, serviceName })
    );

    // Create the packet content
    // TODO: #1178 Return the validate persona name response as a MessagePacket object

    const packetContent = Buffer.alloc(256);

    // Build the packet
    // NPS_USER_VALID     validation succeeded
    const responsePacket = new NPSMessage("sent");
    responsePacket.msgNo = 0x6_01;
    responsePacket.setContent(packetContent);

    log.debug(
      `NPSMsg response object from _npsValidatePersonaName',
      ${JSON.stringify({
        NPSMsg: responsePacket.toJSON(),
      })}`
    );
    responsePacket.dumpPacket();

    log.debug(
      `[npsValidatePersonaName] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
    );
    return Promise.resolve(responsePacket);
  }

  /**
   *
   *
   * @param {Socket} socket
   * @param {NPSMessage} packet
   * @return {void}
   * @memberof PersonaServer
   */
  sendPacket(socket: Socket, packet: NPSMessage): void {
    try {
      // deepcode ignore WrongNumberOfArgs: False alert
      socket.write(packet.serialize());
    } catch (error) {
      if (error instanceof Error) {
        throw new TypeError(`Unable to send packet: ${error.message}`);
      }

      throw new Error("Unable to send packet, error unknown");
    }
  }

  /**
   *
   * @param {number} customerId
   * @return {Promise<IPersonaRecord[]>}
   */
  async getPersonasByCustomerId(customerId: number): Promise<PersonaRecord[]> {
    const results = personaRecords.filter(
      (persona) => persona.customerId === customerId
    );
    return Promise.resolve(results);
  }

  /**
   * Lookup all personas owned by the customer id
   *
   * TODO: Store in a database, instead of being hard-coded
   *
   * @param {number} customerId
   * @return {Promise<PersonaRecord[]>}
   */
  async getPersonaMapsByCustomerId(
    customerId: number
  ): Promise<PersonaRecord[]> {
    switch (customerId) {
      case 2_868_969_472:
      case 5_551_212:
        return this.getPersonasByCustomerId(customerId);
      default:
        return [];
    }
  }

  /**
   * Handle a get persona maps packet
   * @param {Buffer} data
   * @return {Promise<NPSMessage>}
   */
  async getPersonaMaps(data: Buffer): Promise<NPSMessage> {
    log.debug("_npsGetPersonaMaps...");
    const requestPacket = new NPSMessage("recieved").deserialize(data);

    log.debug(
      `NPSMsg request object from _npsGetPersonaMaps',
      ${JSON.stringify({
        NPSMsg: requestPacket.toJSON(),
      })}`
    );
    log.debug(
      `NPSMsg request object from _npsGetPersonaMaps',
      ${JSON.stringify({
        NPSMsg: requestPacket.toJSON(),
      })}`
    );
    requestPacket.dumpPacket();

    const customerId = Buffer.alloc(4);
    data.copy(customerId, 0, 12);
    const personas = await this.getPersonaMapsByCustomerId(
      customerId.readUInt32BE(0)
    );
    log.debug(
      `${personas.length} personas found for ${customerId.readUInt32BE(0)}`
    );

    const personaMapsMessage = new NPSPersonaMapsMessage("sent");

    if (personas.length === 0) {
      throw new Error(
        `No personas found for customer Id: ${customerId.readUInt32BE(0)}`
      );
    } else {
      try {
        personaMapsMessage.loadMaps(personas);

        const responsePacket = new NPSMessage("sent");
        responsePacket.msgNo = 0x6_07;
        responsePacket.setContent(personaMapsMessage.serialize());
        log.debug(
          `NPSMsg response object from _npsGetPersonaMaps: ${JSON.stringify({
            NPSMsg: responsePacket.toJSON(),
          })}`
        );

        responsePacket.dumpPacket();

        return responsePacket;
      } catch (error) {
        if (error instanceof Error) {
          throw new TypeError(
            `Error serializing personaMapsMsg: ${error.message}`
          );
        }

        throw new Error("Error serializing personaMapsMsg, error unknonw");
      }
    }
  }
}

/**
 * Entry and exit point for the persona service
 *
 * @export
 * @param {BufferWithConnection} dataConnection
 * @return {Promise<GServiceResponse>}
 */
export async function receivePersonaData(
  dataConnection: BufferWithConnection
): Promise<GServiceResponse> {
  try {
    const serviceResponse = await handleData(dataConnection);
    return {
      err: null,
      response: serviceResponse,
    };
  } catch (error) {
    const errMessage = `There was an error in the persona service: ${errorMessage(
      error
    )}`;
    log.error(errMessage);
    return { err: new Error(errMessage), response: undefined };
  }
}

export { getPersonasByPersonaId } from "./internal.js";
