// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import {debug} from '@drazisil/mco-logger';
import {NPSMsg} from '../MCOTS/nps-msg.js';
import {NPSPersonaMapsMsg} from './nps-persona-maps-msg.js';

/**
 * @module PersonaServer
 */

/**
 * @class
 * @property {IPersonaRecord[]} personaList
 */
class PersonaServer {
  constructor() {
    this.personaList = [
      {
        customerId: 2_868_969_472,
        id: Buffer.from([0x00, 0x00, 0x00, 0x01]),
        maxPersonas: Buffer.from([0x01]),
        name: this._generateNameBuffer('Doc Joe'),
        personaCount: Buffer.from([0x00, 0x01]),
        shardId: Buffer.from([0x00, 0x00, 0x00, 0x2C]),
      },
      {
        customerId: 5_551_212,
        id: Buffer.from([0x00, 0x84, 0x5F, 0xED]),
        maxPersonas: Buffer.from([0x02]),
        name: this._generateNameBuffer('Dr Brown'),
        personaCount: Buffer.from([0x00, 0x01]),
        shardId: Buffer.from([0x00, 0x00, 0x00, 0x2C]),
      },
      {
        customerId: 5_551_212,
        id: Buffer.from([0x00, 0x84, 0x5F, 0xEE]),
        maxPersonas: Buffer.from([0x02]),
        name: this._generateNameBuffer('Morty Dr'),
        personaCount: Buffer.from([0x00, 0x01]),
        shardId: Buffer.from([0x00, 0x00, 0x00, 0x2C]),
      },
    ];
    this.serviceName = 'mcoserver:PersonaServer';
  }

  /**
   *
   * @param {string} name
   * @return {Buffer}
   */
  _generateNameBuffer(name) {
    const nameBuffer = Buffer.alloc(30);
    Buffer.from(name, 'utf8').copy(nameBuffer);
    return nameBuffer;
  }

  /**
   * Handle a select game persona packet
   *
   * @param {Buffer} data
   * @returns {Promise<NPSMsg>}
   */
  async _npsSelectGamePersona(data) {
    debug('_npsSelectGamePersona...', {service: this.serviceName});
    const requestPacket = new NPSMsg('RECEIVED').deserialize(data);
    debug(
      `NPSMsg request object from _npsSelectGamePersona: ${{
        NPSMsg: requestPacket.toJSON(),
      }}`, {service: this.serviceName});

    requestPacket.dumpPacket();

    // Create the packet content
    const packetContent = Buffer.alloc(251);

    // Build the packet
    // Response Code
    // 207 = success
    const responsePacket = new NPSMsg('SENT');
    responsePacket.msgNo = 0x2_07;
    responsePacket.setContent(packetContent);
    debug(
      `NPSMsg response object from _npsSelectGamePersona',
      ${{
    NPSMsg: responsePacket.toJSON(),
  }}`, {service: this.serviceName},
    );

    responsePacket.dumpPacket();

    debug(
      `[npsSelectGamePersona] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`, {service: this.serviceName},
    );
    return responsePacket;
  }

  /**
   *
   * @param {Buffer} data
   * @returns {Promise<NPSMsg>}
   */
  async _npsNewGameAccount(data) {
    const requestPacket = new NPSMsg('RECEIVED').deserialize(data);
    debug(
      `NPSMsg request object from _npsNewGameAccount',
      ${{
    NPSMsg: requestPacket.toJSON(),
  }}`, {service: this.serviceName},
    );

    requestPacket.dumpPacket();

    const rPacket = new NPSMsg('SENT');
    rPacket.msgNo = 0x6_01;
    debug(
      `NPSMsg response object from _npsNewGameAccount',
      ${{
    NPSMsg: rPacket.toJSON(),
  }}`, {service: this.serviceName},
    );

    rPacket.dumpPacket();

    return rPacket;
  }

  /**
   * Mark a persona as logged out
   * TODO: Change the persona record to show logged out. This requires it to exist first, it is currently hard-coded
   * TODO: Locate the connection and delete, or reset it.
   *
   * @param {Buffer} data
   * @returns {Promise<NPSMsg>}
   */
  async _npsLogoutGameUser(data) {
    debug('[personaServer] Logging out persona...', {service: this.serviceName});
    const requestPacket = new NPSMsg('RECEIVED').deserialize(data);
    debug(
      `NPSMsg request object from _npsLogoutGameUser',
      ${{
    NPSMsg: requestPacket.toJSON(),
  }}`, {service: this.serviceName},
    );

    requestPacket.dumpPacket();

    // Create the packet content
    const packetContent = Buffer.alloc(257);

    // Build the packet
    const responsePacket = new NPSMsg('SENT');
    responsePacket.msgNo = 0x6_12;
    responsePacket.setContent(packetContent);
    debug(
      `NPSMsg response object from _npsLogoutGameUser',
      ${{
    NPSMsg: responsePacket.toJSON(),
  }}`, {service: this.serviceName},
    );

    responsePacket.dumpPacket();

    debug(
      `[npsLogoutGameUser] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`, {service: this.serviceName},
    );
    return responsePacket;
  }

  /**
   * Handle a check token packet
   *
   * @param {Buffer} data
   * @returns {Promise<NPSMsg>}
   */
  async _npsCheckToken(data) {
    debug('_npsCheckToken...', {service: this.serviceName});
    const requestPacket = new NPSMsg('RECEIVED').deserialize(data);
    debug(
      `NPSMsg request object from _npsCheckToken',
      ${{
    NPSMsg: requestPacket.toJSON(),
  }}`, {service: this.serviceName},
    );

    requestPacket.dumpPacket();

    const customerId = data.readInt32BE(12);
    const plateName = data.slice(17).toString();
    debug(`customerId: ${customerId}`, {service: this.serviceName});
    debug(`Plate name: ${plateName}`, {service: this.serviceName});

    // Create the packet content

    const packetContent = Buffer.alloc(256);

    // Build the packet
    // NPS_ACK = 207
    const responsePacket = new NPSMsg('SENT');
    responsePacket.msgNo = 0x2_07;
    responsePacket.setContent(packetContent);
    debug(
      `NPSMsg response object from _npsCheckToken',
      ${{
    NPSMsg: responsePacket.toJSON(),
  }}`, {service: this.serviceName},
    );
    responsePacket.dumpPacket();

    debug(
      `[npsCheckToken] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`, {service: this.serviceName},
    );
    return responsePacket;
  }

  /**
   * Handle a get persona maps packet
   *
   * @param {Buffer} data
   * @returns {Promise<NPSMsg>}
   */
  async _npsValidatePersonaName(data) {
    debug('_npsValidatePersonaName...', {service: this.serviceName});
    const requestPacket = new NPSMsg('RECEIVED').deserialize(data);

    debug(
      `NPSMsg request object from _npsValidatePersonaName',
      ${{
    NPSMsg: requestPacket.toJSON(),
  }}`, {service: this.serviceName},
    );
    requestPacket.dumpPacket();

    const customerId = data.readInt32BE(12);
    const requestedPersonaName = data
      .slice(18, data.lastIndexOf(0x00))
      .toString();
    const serviceName = data.slice(data.indexOf(0x0A) + 1).toString();
    debug(`${{customerId, requestedPersonaName, serviceName}}`, {service: this.serviceName});

    // Create the packet content
    // TODO: Create a real personas map packet, instead of using a fake one that (mostly) works

    const packetContent = Buffer.alloc(256);

    // Build the packet
    // NPS_USER_VALID     validation succeeded
    const responsePacket = new NPSMsg('SENT');
    responsePacket.msgNo = 0x6_01;
    responsePacket.setContent(packetContent);

    debug(
      `NPSMsg response object from _npsValidatePersonaName',
      ${{
    NPSMsg: responsePacket.toJSON(),
  }}`, {service: this.serviceName},
    );
    responsePacket.dumpPacket();

    debug(
      `[npsValidatePersonaName] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`, {service: this.serviceName},
    );
    return responsePacket;
  }

  /**
   *
   *
   * @param {Socket} socket
   * @param {NPSMsg} packet
   * @returns {void}
   * @memberof PersonaServer
   */
  _send(socket, packet) {
    try {
      socket.write(packet.serialize());
    } catch (error) {
      if (error instanceof Error) {
        throw new TypeError(`Unable to send packet: ${error}`);
      }

      throw new Error('Unable to send packet, error unknown');
    }
  }

  /**
   *
   * @param {number} customerId
   * @return {Promise<IPersonaRecord[]>}
   */
  async _getPersonasByCustomerId(customerId) {
    const results = this.personaList.filter(persona => persona.customerId === customerId);
    if (results.length === 0) {
      throw new Error(
        `Unable to locate a persona for customerId: ${customerId}`,
      );
    } else {
      return results;
    }
  }

  /**
   *
   * @param {number} id
   * @return {Promise<IPersonaRecord[]>}
   */
  async _getPersonasById(id) {
    const results = this.personaList.filter(persona => {
      const match = id === persona.id.readInt32BE(0);
      return match;
    });
    if (results.length === 0) {
      throw new Error(`Unable to locate a persona for id: ${id}`);
    }

    return results;
  }

  /**
   * Lookup all personas owned by the customer id
   * TODO: Store in a database, instead of being hard-coded
   *
   * @param {number} customerId
   * @returns {Promise<IPersonaRecord[]>}
   */
  async _npsGetPersonaMapsByCustomerId(customerId) {
    switch (customerId) {
      case 2_868_969_472:
      case 5_551_212:
        return this._getPersonasByCustomerId(customerId);
      default:
        return [];
    }
  }

  /**
   * Handle a get persona maps packet
   * @param {Buffer} data
   * @returns {Promise<NPSMsg>}
   */
  async _npsGetPersonaMaps(data) {
    debug('_npsGetPersonaMaps...', {service: this.serviceName});
    const requestPacket = new NPSMsg('RECEIVED').deserialize(data);

    debug(`NPSMsg request object from _npsGetPersonaMaps',
      ${{
    NPSMsg: requestPacket.toJSON(),
  }}`, {service: this.serviceName});
    debug(
      `NPSMsg request object from _npsGetPersonaMaps',
      ${{
    NPSMsg: requestPacket.toJSON(),
  }}`, {service: this.serviceName},
    );
    requestPacket.dumpPacket();

    const customerId = Buffer.alloc(4);
    data.copy(customerId, 0, 12);
    const personas = await this._npsGetPersonaMapsByCustomerId(
      customerId.readUInt32BE(0),
    );
    debug(
      `${personas.length} personas found for ${customerId.readUInt32BE(0)}`, {service: this.serviceName},
    );

    let responsePacket;

    const personaMapsMessage = new NPSPersonaMapsMsg('SENT');

    if (personas.length === 0) {
      throw new Error(
        `No personas found for customer Id: ${customerId.readUInt32BE(0)}`,
      );
    } else {
      try {
        personaMapsMessage.loadMaps(personas);

        responsePacket = new NPSMsg('SENT');
        responsePacket.msgNo = 0x6_07;
        responsePacket.setContent(personaMapsMessage.serialize());
        debug(
          `NPSMsg response object from _npsGetPersonaMaps: ${{
            NPSMsg: responsePacket.toJSON(),
          }
          }`, {service: this.serviceName},
        );

        responsePacket.dumpPacket();
      } catch (error) {
        if (error instanceof Error) {
          throw new TypeError(`Error serializing personaMapsMsg: ${error}`);
        }

        throw new Error('Error serializing personaMapsMsg, error unknonw');
      }
    }

    return responsePacket;
  }

  /**
   * Route an incoming persona packet to the connect handler
   *
   * @param {IRawPacket} rawPacket
   * @returns {Promise<ConnectionObj>}
   */
  async dataHandler(rawPacket) {
    const {connection, data, localPort, remoteAddress} = rawPacket;
    const {sock} = connection;
    const updatedConnection = connection;
    debug(
      `Received Persona packet',
      ${{localPort, remoteAddress, data: rawPacket.data.toString('hex')}}`, {service: this.serviceName},
    );
    const requestCode = data.readUInt16BE(0).toString(16);
    let responsePacket;

    switch (requestCode) {
      case '503':
        // NPS_REGISTER_GAME_LOGIN = 0x503
        responsePacket = await this._npsSelectGamePersona(data);
        this._send(sock, responsePacket);
        return updatedConnection;

      case '507':
        // NPS_NEW_GAME_ACCOUNT == 0x507
        responsePacket = await this._npsNewGameAccount(data);
        this._send(sock, responsePacket);
        return updatedConnection;

      case '50f':
        // NPS_REGISTER_GAME_LOGOUT = 0x50F
        responsePacket = await this._npsLogoutGameUser(data);
        this._send(sock, responsePacket);
        return updatedConnection;

      case '532':
        // NPS_GET_PERSONA_MAPS = 0x532
        responsePacket = await this._npsGetPersonaMaps(data);
        this._send(sock, responsePacket);
        return updatedConnection;

      case '533':
        // NPS_VALIDATE_PERSONA_NAME   = 0x533
        responsePacket = await this._npsValidatePersonaName(data);
        this._send(sock, responsePacket);
        return updatedConnection;

      case '534':
        // NPS_CHECK_TOKEN   = 0x534
        responsePacket = await this._npsCheckToken(data);
        this._send(sock, responsePacket);
        return updatedConnection;

      default:
        throw new Error(
          `[personaServer] Unknown code was received ${{
            requestCode,
            localPort,
          }}`,
        );
    }
  }
}
const _PersonaServer = PersonaServer;
export {_PersonaServer as PersonaServer};
