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

import { handleData, personaRecords } from "./internal.js";
import { NPSPersonaMapsMessage } from "./NPSPersonaMapsMessage.js";
import log from '../../../log.js'
import { NPSMessage } from "../../mcos-gateway/src/NPSMessage.js";

/**
 * Selects a game persona and marks it as in use
 * @param {NPSMessage} requestPacket
 * @returns {Promise<NPSMessage>}
 */
export async function handleSelectGamePersona(
    requestPacket
) {
    log.info("_npsSelectGamePersona...");
    log.info(
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
    log.info(
        `NPSMsg response object from _npsSelectGamePersona',
    ${JSON.stringify({
        NPSMsg: responsePacket.toJSON(),
    })}`
    );

    responsePacket.dumpPacket();

    log.info(
        `[npsSelectGamePersona] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
    );
    return responsePacket;
}

/**
 * @global
 * @typedef {object} PersonaRecord
 * @property { Number} customerId
 * @property {Buffer} id
 * @property {Buffer} maxPersonas
 * @property {Buffer} name
 * @property {Buffer} personaCount
 * @property {Buffer} shardId
 */

/**
 * Please use {@link PersonaServer.getInstance()}
 * @classdesc
 * @property {PersonaRecord[]} personaList
 */
export class PersonaServer {
    /**
     *
     *
     * @static
     * @type {PersonaServer}
     * @memberof PersonaServer
     */
    static _instance;

    /**
     * Return the instance of the Persona Server class
     * @returns {PersonaServer}
     */
    static getInstance() {
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
    async createNewGameAccount(data) {
        const requestPacket = new NPSMessage("received").deserialize(data);
        log.info(
            `NPSMsg request object from _npsNewGameAccount',
      ${JSON.stringify({
          NPSMsg: requestPacket.toJSON(),
      })}`
        );

        requestPacket.dumpPacket();

        const rPacket = new NPSMessage("sent");
        rPacket.msgNo = 0x6_01;
        log.info(
            `NPSMsg response object from _npsNewGameAccount',
      ${JSON.stringify({
          NPSMsg: rPacket.toJSON(),
      })}`
        );

        rPacket.dumpPacket();

        return rPacket;
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
    async logoutGameUser(data) {
        log.info("[personaServer] Logging out persona...");
        const requestPacket = new NPSMessage("received").deserialize(data);
        log.info(
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
        log.info(
            `NPSMsg response object from _npsLogoutGameUser',
      ${JSON.stringify({
          NPSMsg: responsePacket.toJSON(),
      })}`
        );

        responsePacket.dumpPacket();

        log.info(
            `[npsLogoutGameUser] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
        );
        return responsePacket;
    }

    /**
     * Handle a check token packet
     *
     * @param {Buffer} data
     * @return {Promise<NPSMessage>}
     * @memberof PersonaServer
     */
    async validateLicencePlate(data) {
        log.info("_npsCheckToken...");
        const requestPacket = new NPSMessage("received").deserialize(data);
        log.info(
            `NPSMsg request object from _npsCheckToken',
      ${JSON.stringify({
          NPSMsg: requestPacket.toJSON(),
      })}`
        );

        requestPacket.dumpPacket();

        const customerId = data.readInt32BE(12);
        const plateName = data.subarray(17).toString();
        log.info(`customerId: ${customerId}`); // skipcq: JS-0378
        log.info(`Plate name: ${plateName}`); // skipcq: JS-0378

        // Create the packet content

        const packetContent = Buffer.alloc(256);

        // Build the packet
        // NPS_ACK = 207
        const responsePacket = new NPSMessage("sent");
        responsePacket.msgNo = 0x2_07;
        responsePacket.setContent(packetContent);
        log.info(
            `NPSMsg response object from _npsCheckToken',
      ${JSON.stringify({
          NPSMsg: responsePacket.toJSON(),
      })}`
        );
        responsePacket.dumpPacket();

        log.info(
            `[npsCheckToken] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
        );
        return responsePacket;
    }

    /**
     * Handle a get persona maps packet
     *
     * @param {Buffer} data
     * @return {Promise<NPSMessage>}
     */
    async validatePersonaName(data) {
        log.info("_npsValidatePersonaName...");
        const requestPacket = new NPSMessage("received").deserialize(data);

        log.info(
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
        log.info(
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

        log.info(
            `NPSMsg response object from _npsValidatePersonaName',
      ${JSON.stringify({
          NPSMsg: responsePacket.toJSON(),
      })}`
        );
        responsePacket.dumpPacket();

        log.info(
            `[npsValidatePersonaName] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
        );
        return responsePacket;
    }

    /**
     *
     *
     * @param {import('node:net').Socket} socket
     * @param {NPSMessage} packet
     * @return {void}
     * @memberof PersonaServer
     */
    sendPacket(socket, packet) {
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
     * @return {Promise<PersonaRecord[]>}
     */
    async getPersonasByCustomerId(
        customerId
    ) {
        return personaRecords.filter(
            (persona) => persona.customerId === customerId
        );
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
        customerId
    ) {
        switch (customerId) {
            case 2_868_969_472:
            case 5_551_212:
                return await this.getPersonasByCustomerId(customerId);
            default:
                return [];
        }
    }

    /**
     * Handle a get persona maps packet
     * @param {Buffer} data
     * @return {Promise<NPSMessage>}
     */
    async getPersonaMaps(data) {
        log.info("_npsGetPersonaMaps...");
        const requestPacket = new NPSMessage("received").deserialize(data);

        log.info(
            `NPSMsg request object from _npsGetPersonaMaps',
      ${JSON.stringify({
          NPSMsg: requestPacket.toJSON(),
      })}`
        );
        log.info(
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
        log.info(
            `${personas.length} personas found for ${customerId.readUInt32BE(
                0
            )}`
        );

        const personaMapsMessage = new NPSPersonaMapsMessage("sent");

        if (personas.length === 0) {
            throw new Error(
                `No personas found for customer Id: ${customerId.readUInt32BE(
                    0
                )}`
            );
        } else {
            try {
                personaMapsMessage.loadMaps(personas);

                const responsePacket = new NPSMessage("sent");
                responsePacket.msgNo = 0x6_07;
                responsePacket.setContent(personaMapsMessage.serialize());
                log.info(
                    `NPSMsg response object from _npsGetPersonaMaps: ${JSON.stringify(
                        {
                            NPSMsg: responsePacket.toJSON(),
                        }
                    )}`
                );

                responsePacket.dumpPacket();

                return responsePacket;
            } catch (error) {
                if (error instanceof Error) {
                    throw new TypeError(
                        `Error serializing personaMapsMsg: ${error.message}`
                    );
                }

                throw new Error(
                    "Error serializing personaMapsMsg, error unknonw"
                );
            }
        }
    }
}


/**
 * Entry and exit point for the persona service
 *
 * @export
 * @param {import("../../mcos-gateway/src/sockets.js").BufferWithConnection} dataConnection
 * @return {Promise<import("../../mcos-gateway/src/sockets.js").ServiceResponse>}
 */
export async function receivePersonaData(
    dataConnection
) {
    try {
        return await handleData(dataConnection);
    } catch (error) {
        throw new Error(
            `There was an error in the persona service: ${String(error)}`
        );
    }
}

export { getPersonasByPersonaId } from "./internal.js";
