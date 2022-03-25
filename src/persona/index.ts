// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { logger } from "../logger/index";
import { Socket } from "net";
import {
  EMessageDirection,
  PersonaRecord,
  UnprocessedPacket,
} from "../types/index";
import { NPSMessage, NPSPersonaMapsMessage } from "../message-types/index";
import { TCPConnection } from "../core/tcpConnection";

const log = logger.child({ service: "mcoserver:PersonaServer" });

const NAME_BUFFER_SIZE = 30;

/**
 * Return string as buffer
 * @param {string} name
 * @param {number} size
 * @param {BufferEncoding} [="utf8"]
 * @returns {Buffer}
 */
export function generateNameBuffer(
  name: string,
  size: number,
  encoding: BufferEncoding = "utf8"
): Buffer {
  const nameBuffer = Buffer.alloc(size);
  Buffer.from(name, encoding).copy(nameBuffer);
  return nameBuffer;
}

/**
 * Return a list of all personas
 * @returns {PersonaRecord[]}
 */
export function fetchPersonas(): PersonaRecord[] {
  const personaList: PersonaRecord[] = [
    {
      customerId: 2_868_969_472,
      id: Buffer.from([0x00, 0x00, 0x00, 0x01]),
      maxPersonas: Buffer.from([0x01]),
      name: generateNameBuffer("Doc Joe", NAME_BUFFER_SIZE),
      personaCount: Buffer.from([0x00, 0x01]),
      shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c]),
    },
    {
      customerId: 5_551_212,
      id: Buffer.from([0x00, 0x84, 0x5f, 0xed]),
      maxPersonas: Buffer.from([0x02]),
      name: generateNameBuffer("Dr Brown", NAME_BUFFER_SIZE),
      personaCount: Buffer.from([0x00, 0x01]),
      shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c]),
    },
    {
      customerId: 5_551_212,
      id: Buffer.from([0x00, 0x84, 0x5f, 0xee]),
      maxPersonas: Buffer.from([0x02]),
      name: generateNameBuffer("Morty Dr", NAME_BUFFER_SIZE),
      personaCount: Buffer.from([0x00, 0x01]),
      shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c]),
    },
  ];
  return personaList;
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
  const responsePacket = new NPSMessage(EMessageDirection.SENT);
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
 * @class
 * @property {IPersonaRecord[]} personaList
 */
export class PersonaServer {
  static _instance: PersonaServer;

  /**
   * Return the instance of the Persona Server class
   * @returns {PersonaServer}
   */
  static getInstance(): PersonaServer {
    if (!PersonaServer._instance) {
      PersonaServer._instance = new PersonaServer();
    }
    return PersonaServer._instance;
  }

  private constructor() {
    // Intentionally empty
  }

  /**
   * Create a new game persona record
   */
  async createNewGameAccount(data: Buffer): Promise<NPSMessage> {
    const requestPacket = new NPSMessage(
      EMessageDirection.RECEIVED
    ).deserialize(data);
    log.debug(
      `NPSMsg request object from _npsNewGameAccount',
      ${JSON.stringify({
        NPSMsg: requestPacket.toJSON(),
      })}`
    );

    requestPacket.dumpPacket();

    const rPacket = new NPSMessage(EMessageDirection.SENT);
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

  //  * TODO: Change the persona record to show logged out. This requires it to exist first, it is currently hard-coded
  //  * TODO: Locate the connection and delete, or reset it.
  /**
   * Log out a game persona
   */
  async logoutGameUser(data: Buffer): Promise<NPSMessage> {
    log.debug("[personaServer] Logging out persona...");
    const requestPacket = new NPSMessage(
      EMessageDirection.RECEIVED
    ).deserialize(data);
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
    const responsePacket = new NPSMessage(EMessageDirection.SENT);
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
   */
  async validateLicencePlate(data: Buffer): Promise<NPSMessage> {
    log.debug("_npsCheckToken...");
    const requestPacket = new NPSMessage(
      EMessageDirection.RECEIVED
    ).deserialize(data);
    log.debug(
      `NPSMsg request object from _npsCheckToken',
      ${JSON.stringify({
        NPSMsg: requestPacket.toJSON(),
      })}`
    );

    requestPacket.dumpPacket();

    const customerId = data.readInt32BE(12);
    const plateName = data.slice(17).toString();
    log.debug(`customerId: ${customerId}`); // skipcq: JS-0378
    log.debug(`Plate name: ${plateName}`); // skipcq: JS-0378

    // Create the packet content

    const packetContent = Buffer.alloc(256);

    // Build the packet
    // NPS_ACK = 207
    const responsePacket = new NPSMessage(EMessageDirection.SENT);
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
   * @return {Promise<NPSMsg>}
   */
  async validatePersonaName(data: Buffer): Promise<NPSMessage> {
    log.debug("_npsValidatePersonaName...");
    const requestPacket = new NPSMessage(
      EMessageDirection.RECEIVED
    ).deserialize(data);

    log.debug(
      `NPSMsg request object from _npsValidatePersonaName',
      ${JSON.stringify({
        NPSMsg: requestPacket.toJSON(),
      })}`
    );
    requestPacket.dumpPacket();

    const customerId = data.readInt32BE(12);
    const requestedPersonaName = data
      .slice(18, data.lastIndexOf(0x00))
      .toString();
    const serviceName = data.slice(data.indexOf(0x0a) + 1).toString(); // skipcq: JS-0377
    log.debug(
      JSON.stringify({ customerId, requestedPersonaName, serviceName })
    );

    // Create the packet content
    // TODO: Create a real personas map packet, instead of using a fake one that (mostly) works

    const packetContent = Buffer.alloc(256);

    // Build the packet
    // NPS_USER_VALID     validation succeeded
    const responsePacket = new NPSMessage(EMessageDirection.SENT);
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
   * @param {NPSMsg} packet
   * @return {void}
   * @memberof PersonaServer
   */
  sendPacket(socket: Socket, packet: NPSMessage): void {
    try {
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
    const allPersonas = fetchPersonas();
    const results = allPersonas.filter(
      (persona) => persona.customerId === customerId
    );
    return Promise.resolve(results);
  }

  /**
   *
   * @param {number} id
   * @return {Promise<IPersonaRecord[]>}
   */
  async getPersonasByPersonaId(id: number): Promise<PersonaRecord[]> {
    const allPersonas = fetchPersonas();
    const results = allPersonas.filter((persona) => {
      const match = id === persona.id.readInt32BE(0);
      return match;
    });
    if (results.length === 0) {
      throw new Error(`Unable to locate a persona for id: ${id}`);
    }

    return Promise.resolve(results);
  }

  /**
   * Lookup all personas owned by the customer id
   * TODO: Store in a database, instead of being hard-coded
   *
   * @param {number} customerId
   * @return {Promise<IPersonaRecord[]>}
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
   * @return {Promise<NPSMsg>}
   */
  async getPersonaMaps(data: Buffer): Promise<NPSMessage> {
    log.debug("_npsGetPersonaMaps...");
    const requestPacket = new NPSMessage(
      EMessageDirection.RECEIVED
    ).deserialize(data);

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

    const personaMapsMessage = new NPSPersonaMapsMessage(
      EMessageDirection.SENT
    );

    if (personas.length === 0) {
      throw new Error(
        `No personas found for customer Id: ${customerId.readUInt32BE(0)}`
      );
    } else {
      try {
        personaMapsMessage.loadMaps(personas);

        const responsePacket = new NPSMessage(EMessageDirection.SENT);
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

  /**
   * Handle inbound packets for the persona server
   */
  async dataHandler(rawPacket: UnprocessedPacket): Promise<TCPConnection> {
    const { connection, data } = rawPacket;
    const { sock, localPort, remoteAddress } = connection;
    const updatedConnection = connection;
    log.debug(
      `Received Persona packet',
      ${JSON.stringify({
        localPort,
        remoteAddress,
        data: rawPacket.data.toString("hex"),
      })}`
    );
    const requestCode = data.readUInt16BE(0).toString(16);

    switch (requestCode) {
      case "503": {
        const requestPacket = new NPSMessage(
          EMessageDirection.RECEIVED
        ).deserialize(data);
        // NPS_REGISTER_GAME_LOGIN = 0x503
        const responsePacket = await handleSelectGamePersona(requestPacket);
        this.sendPacket(sock, responsePacket);
        return updatedConnection;
      }

      case "507": {
        // NPS_NEW_GAME_ACCOUNT == 0x507
        const responsePacket = await this.createNewGameAccount(data);
        this.sendPacket(sock, responsePacket);
        return updatedConnection;
      }

      case "50f": {
        // NPS_REGISTER_GAME_LOGOUT = 0x50F
        const responsePacket = await this.logoutGameUser(data);
        this.sendPacket(sock, responsePacket);
        return updatedConnection;
      }

      case "532": {
        // NPS_GET_PERSONA_MAPS = 0x532
        const responsePacket = await this.getPersonaMaps(data);
        this.sendPacket(sock, responsePacket);
        return updatedConnection;
      }

      case "533": {
        // NPS_VALIDATE_PERSONA_NAME   = 0x533
        const responsePacket = await this.validatePersonaName(data);
        this.sendPacket(sock, responsePacket);
        return updatedConnection;
      }
      case "534": {
        // NPS_CHECK_TOKEN   = 0x534
        const responsePacket = await this.validateLicencePlate(data);
        this.sendPacket(sock, responsePacket);
        return updatedConnection;
      }
    }
    throw new Error(
      `[personaServer] Unknown code was received ${JSON.stringify({
        requestCode,
        localPort,
      })}`
    );
  }
}
