// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Socket } from "net";
import { IPersonaRecord } from "../services/shared/interfaces/IPersonaRecord";
import { IRawPacket } from "../services/shared/interfaces/IRawPacket";
import * as bunyan from "bunyan";
import { MSG_DIRECTION, NPSMsg } from "../services/shared/messageTypes/NPSMsg";
import { NPSPersonaMapsMsg } from "../services/shared/messageTypes/NPSPersonaMapsMsg";

export class PersonaServer {
  public logger: bunyan;
  private personaList: IPersonaRecord[] = [
    {
      customerId: 2868969472,
      id: Buffer.from([0x00, 0x00, 0x00, 0x01]),
      maxPersonas: Buffer.from([0x01]),
      name: this._generateNameBuffer("Doc Joe"),
      personaCount: Buffer.from([0x00, 0x01]),
      shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c]),
    },
    {
      customerId: 5551212,
      id: Buffer.from([0x00, 0x84, 0x5f, 0xed]),
      maxPersonas: Buffer.from([0x02]),
      name: this._generateNameBuffer("Dr Brown"),
      personaCount: Buffer.from([0x00, 0x01]),
      shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c]),
    },
    {
      customerId: 5551212,
      id: Buffer.from([0x00, 0x84, 0x5f, 0xee]),
      maxPersonas: Buffer.from([0x02]),
      name: this._generateNameBuffer("Morty Dr"),
      personaCount: Buffer.from([0x00, 0x01]),
      shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c]),
    },
  ];

  constructor() {
    this.logger = bunyan
      .createLogger({ name: "mcoServer" })
      .child({ module: "PersonaServer" });
  }

  public _generateNameBuffer(name: string) {
    const nameBuffer = Buffer.alloc(30);
    Buffer.from(name, "utf8").copy(nameBuffer);
    return nameBuffer;
  }

  /**
   * Handle a select game persona packet
   * @param {Socket} socket
   * @param {Buffer} rawData
   */
  public async _npsSelectGamePersona(socket: Socket, data: Buffer) {
    this.logger.info(`_npsSelectGamePersona...`);
    const requestPacket = new NPSMsg(MSG_DIRECTION.RECIEVED).deserialize(data);
    this.logger.info({
      message: "NPSMsg request object from _npsSelectGamePersona",
      NPSMsg: requestPacket.toJSON(),
    });

    requestPacket.dumpPacket();

    // Create the packet content
    const packetContent = Buffer.alloc(251);

    // Build the packet
    // Response Code
    // 207 = success
    const responsePacket = new NPSMsg(MSG_DIRECTION.SENT);
    responsePacket.msgNo = 0x207;
    responsePacket.setContent(packetContent);
    this.logger.info({
      message: "NPSMsg response object from _npsSelectGamePersona",
      NPSMsg: responsePacket.toJSON(),
    });

    responsePacket.dumpPacket();

    this.logger.info(
      `[npsSelectGamePersona] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
    );
    return responsePacket;
  }

  public async _npsNewGameAccount(sock: Socket, data: Buffer) {
    const requestPacket = new NPSMsg(MSG_DIRECTION.RECIEVED).deserialize(data);
    this.logger.info({
      message: "NPSMsg response object from _npsNewGameAccount",
      NPSMsg: requestPacket.toJSON(),
    });

    requestPacket.dumpPacket();

    const rPacket = new NPSMsg(MSG_DIRECTION.SENT);
    rPacket.msgNo = 0x601;
    this.logger.info({
      message: "NPSMsg response object from _npsNewGameAccount",
      NPSMsg: rPacket.toJSON(),
    });

    rPacket.dumpPacket();

    return rPacket;
  }

  /**
   * Mark a persona as logged out
   * TODO: Change the persona record to show logged out. This requires it to exist first, it is currently hard-coded
   * TODO: Locate the connection and delete, or reset it.
   * @param {Socket} socket
   * @param {Buffer} data
   */
  public async _npsLogoutGameUser(socket: Socket, data: Buffer) {
    this.logger.info("[personaServer] Logging out persona...");
    const requestPacket = new NPSMsg(MSG_DIRECTION.RECIEVED).deserialize(data);
    this.logger.info({
      message: "NPSMsg request object from _npsLogoutGameUser",
      NPSMsg: requestPacket.toJSON(),
    });

    requestPacket.dumpPacket();

    // Create the packet content
    const packetContent = Buffer.alloc(257);

    // Build the packet
    const responsePacket = new NPSMsg(MSG_DIRECTION.SENT);
    responsePacket.msgNo = 0x612;
    responsePacket.setContent(packetContent);
    this.logger.info({
      message: "NPSMsg response object from _npsLogoutGameUser",
      NPSMsg: responsePacket.toJSON(),
    });

    responsePacket.dumpPacket();

    this.logger.info(
      `[npsLogoutGameUser] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
    );
    return responsePacket;
  }

  /**
   * Handle a get persona maps packet
   * @param {Socket} socket
   * @param {Buffer} data
   */
  public async _npsCheckToken(socket: Socket, data: Buffer) {
    this.logger.info(`_npsCheckToken...`);
    const requestPacket = new NPSMsg(MSG_DIRECTION.RECIEVED).deserialize(data);
    this.logger.info({
      message: "NPSMsg request object from _npsCheckToken",
      NPSMsg: requestPacket.toJSON(),
    });

    requestPacket.dumpPacket();

    const customerId = data.readInt32BE(12);
    const plateName = data.slice(17).toString();
    this.logger.info(`customerId: ${customerId}`);
    this.logger.info(`Plate name: ${plateName}`);

    // Create the packet content

    const packetContent = Buffer.alloc(256);

    // Build the packet
    // NPS_ACK = 207
    const responsePacket = new NPSMsg(MSG_DIRECTION.SENT);
    responsePacket.msgNo = 0x207;
    responsePacket.setContent(packetContent);
    this.logger.info({
      message: "NPSMsg response object from _npsCheckToken",
      NPSMsg: responsePacket.toJSON(),
    });
    responsePacket.dumpPacket();
    // const responsePacket = buildPacket(1024, 0x0207, packetContent);

    this.logger.info(
      `[npsCheckToken] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
    );
    return responsePacket;
  }

  /**
   * Handle a get persona maps packet
   * @param {Socket} socket
   * @param {Buffer} data
   */
  public async _npsValidatePersonaName(socket: Socket, data: Buffer) {
    this.logger.info(`_npsValidatePersonaName...`);
    const requestPacket = new NPSMsg(MSG_DIRECTION.RECIEVED).deserialize(data);

    this.logger.info({
      message: "NPSMsg request object from _npsValidatePersonaName",
      NPSMsg: requestPacket.toJSON(),
    });
    requestPacket.dumpPacket();

    const customerId = data.readInt32BE(12);
    const requestedPersonaName = data
      .slice(18, data.lastIndexOf(0x00))
      .toString();
    const serviceName = data.slice(data.indexOf(0x0a) + 1).toString();
    this.logger.info({ customerId, requestedPersonaName, serviceName });

    // Create the packet content
    // TODO: Create a real personas map packet, instead of using a fake one that (mostly) works

    const packetContent = Buffer.alloc(256);

    // Build the packet
    // NPS_USER_VALID     validation succeeded
    const responsePacket = new NPSMsg(MSG_DIRECTION.SENT);
    responsePacket.msgNo = 0x601;
    responsePacket.setContent(packetContent);

    this.logger.info({
      message: "NPSMsg response object from _npsValidatePersonaName",
      NPSMsg: responsePacket.toJSON(),
    });
    responsePacket.dumpPacket();

    this.logger.info(
      `[npsValidatePersonaName] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
    );
    return responsePacket;
  }

  public _send(socket: Socket, packet: NPSMsg) {
    try {
      socket.write(packet.serialize());
    } catch (error) {
      this.logger.error(`Unable to send packet: ${error}`);
    }
  }

  public _getPersonasByCustomerId(customerId: number) {
    let results: IPersonaRecord[];

    results = this.personaList.filter(persona => {
      return persona.customerId == customerId;
    });
    if (!results) {
      this.logger.error(
        `Unable to locate a persona for customerId: ${customerId}`
      );
    }
    return results;
  }

  public _getPersonasById(id: number) {
    let results: IPersonaRecord[];
    results = this.personaList.filter(persona => {
      const match = id === persona.id.readInt32BE(0);
      return match;
    });
    if (!results) {
      this.logger.error(`Unable to locate a persona for id: ${id}`);
    }
    return results;
  }

  /**
   * Lookup all personas owned by the customer id
   * TODO: Store in a database, instead of being hard-coded
   * @param {Int} customerId
   */
  public async _npsGetPersonaMapsByCustomerId(customerId: number) {
    // const name = Buffer.alloc(30);

    switch (customerId) {
      case 2868969472:
        return this._getPersonasByCustomerId(customerId);
      case 5551212:
        return this._getPersonasByCustomerId(customerId);
      default:
        return [];
    }
  }

  /**
   * Handle a get persona maps packet
   * @param {Socket} socket
   * @param {Buffer} data
   */
  public async _npsGetPersonaMaps(socket: Socket, data: Buffer) {
    this.logger.info(`_npsGetPersonaMaps...`);
    const requestPacket = new NPSMsg(MSG_DIRECTION.RECIEVED).deserialize(data);

    this.logger.info({
      message: "NPSMsg request object from _npsGetPersonaMaps",
      NPSMsg: requestPacket.toJSON(),
    });
    requestPacket.dumpPacket();

    const customerId = Buffer.alloc(4);
    data.copy(customerId, 0, 12);
    this.logger.info(
      `npsGetPersonaMaps for customerId: ${customerId.readUInt32BE(0)}`
    );
    const personas = await this._npsGetPersonaMapsByCustomerId(
      customerId.readUInt32BE(0)
    );
    this.logger.info(
      `${personas.length} personas found for ${customerId.readUInt32BE(0)}`
    );

    const personaMapsMsg = new NPSPersonaMapsMsg(MSG_DIRECTION.SENT);

    if (personas.length === 0) {
      this.logger.error("[_npsGetPersonaMaps] No personas found");
    } else {
      personaMapsMsg.loadMaps(personas);
      this.logger.info({
        message: "NPSMsg response object from _npsGetPersonaMaps",
        NPSMsg: personaMapsMsg.toJSON(),
      });
      personaMapsMsg.dumpPacket();
    }
    return personaMapsMsg;
  }

  /**
   * Route an incoming persona packet to the connect handler
   * @param {Socket} socket
   * @param {Buffer} rawData
   */
  public async dataHandler(rawPacket: IRawPacket) {
    const { connection, data, localPort, remoteAddress } = rawPacket;
    const { sock } = connection;
    const updatedConnection = connection;
    this.logger.info({ message: "Received packet", localPort, remoteAddress });
    const requestCode = data.readUInt16BE(0).toString(16);
    let responsePacket: NPSMsg;

    switch (requestCode) {
      case "503":
        // NPS_REGISTER_GAME_LOGIN = 0x503
        responsePacket = await this._npsSelectGamePersona(sock, data);
        this._send(sock, responsePacket);
        return updatedConnection;

      case "507":
        // NPS_NEW_GAME_ACCOUNT == 0x507
        responsePacket = await this._npsNewGameAccount(sock, data);
        this._send(sock, responsePacket);
        return updatedConnection;

      case "50f":
        // NPS_REGISTER_GAME_LOGOUT = 0x50F
        responsePacket = await this._npsLogoutGameUser(sock, data);
        this._send(sock, responsePacket);
        return updatedConnection;
      case "532":
        // NPS_GET_PERSONA_MAPS = 0x532
        responsePacket = await this._npsGetPersonaMaps(sock, data);
        this._send(sock, responsePacket);
        return updatedConnection;
      case "533":
        // NPS_VALIDATE_PERSONA_NAME   = 0x533
        responsePacket = await this._npsValidatePersonaName(sock, data);
        this._send(sock, responsePacket);
        return updatedConnection;
      case "534":
        // NPS_CHECK_TOKEN   = 0x534
        responsePacket = await this._npsCheckToken(sock, data);
        this._send(sock, responsePacket);
        return updatedConnection;
      default:
        this.logger.error({
          message: `[personaServer] Unknown code was received`,
          requestCode,
          localPort,
        });
        return updatedConnection;
    }
  }
}
