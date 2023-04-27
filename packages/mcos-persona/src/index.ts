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

import { NPSMessage } from "mcos/gateway";
import { handleData, personaRecords } from "./internal.js";
import { NPSPersonaMapsMessage } from "./NPSPersonaMapsMessage.js";
import { Sentry, TNPSMessage, TPersonaRecord, TServerLogger } from "mcos/shared";

/**
 * Selects a game persona and marks it as in use
 * @param {NPSMessage} requestPacket
 * @param {import("mcos/shared").TServerLogger} log
 * @returns {Promise<NPSMessage>}
 */
export async function handleSelectGamePersona(requestPacket: TNPSMessage, log: TServerLogger): Promise<TNPSMessage> {
    log("debug", "_npsSelectGamePersona...");
    log(
        "debug",
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
    log(
        "debug",
        `NPSMsg response object from _npsSelectGamePersona',
    ${JSON.stringify({
        NPSMsg: responsePacket.toJSON(),
    })}`
    );

    responsePacket.dumpPacket();

    log(
        "debug",
        `[npsSelectGamePersona] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
    );
    return responsePacket;
}

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
    static _instance: PersonaServer;

    /** @type {import("mcos/shared").TServerLogger} */
    #log: import("mcos/shared").TServerLogger;

    /**
     * PLease use getInstance() instead
     * @author Drazi Crendraven
     * @param {import("mcos/shared").TServerLogger} log
     * @memberof PersonaServer
     */
    constructor(log: import("mcos/shared").TServerLogger) {
        this.#log = log;
    }

    /**
     * Return the instance of the Persona Server class
     * @param {import("mcos/shared").TServerLogger} log
     * @returns {PersonaServer}
     */
    static getInstance(log: import("mcos/shared").TServerLogger): PersonaServer {
        if (typeof PersonaServer._instance === "undefined") {
            PersonaServer._instance = new PersonaServer(log);
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
        const requestPacket = new NPSMessage("received").deserialize(data);
        this.#log(
            "debug",
            `NPSMsg request object from _npsNewGameAccount',
      ${JSON.stringify({
          NPSMsg: requestPacket.toJSON(),
      })}`
        );

        requestPacket.dumpPacket();

        const rPacket = new NPSMessage("sent");
        rPacket.msgNo = 0x6_01;
        this.#log(
            "debug",
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
    async logoutGameUser(data: Buffer): Promise<NPSMessage> {
        this.#log("debug", "[personaServer] Logging out persona...");
        const requestPacket = new NPSMessage("received").deserialize(data);
        this.#log(
            "debug",
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
        this.#log(
            "debug",
            `NPSMsg response object from _npsLogoutGameUser',
      ${JSON.stringify({
          NPSMsg: responsePacket.toJSON(),
      })}`
        );

        responsePacket.dumpPacket();

        this.#log(
            "debug",
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
    async validateLicencePlate(data: Buffer): Promise<NPSMessage> {
        this.#log("debug", "_npsCheckToken...");
        const requestPacket = new NPSMessage("received").deserialize(data);
        this.#log(
            "debug",
            `NPSMsg request object from _npsCheckToken',
      ${JSON.stringify({
          NPSMsg: requestPacket.toJSON(),
      })}`
        );

        requestPacket.dumpPacket();

        const customerId = data.readInt32BE(12);
        const plateName = data.subarray(17).toString();
        this.#log("debug", `customerId: ${customerId}`); // skipcq: JS-0378
        this.#log("debug", `Plate name: ${plateName}`); // skipcq: JS-0378

        // Create the packet content

        const packetContent = Buffer.alloc(256);

        // Build the packet
        // NPS_ACK = 207
        const responsePacket = new NPSMessage("sent");
        responsePacket.msgNo = 0x2_07;
        responsePacket.setContent(packetContent);
        this.#log(
            "debug",
            `NPSMsg response object from _npsCheckToken',
      ${JSON.stringify({
          NPSMsg: responsePacket.toJSON(),
      })}`
        );
        responsePacket.dumpPacket();

        this.#log(
            "debug",
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
    async validatePersonaName(data: Buffer): Promise<NPSMessage> {
        this.#log("debug", "_npsValidatePersonaName...");
        const requestPacket = new NPSMessage("received").deserialize(data);

        this.#log(
            "debug",
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
        this.#log(
            "debug",
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

        this.#log(
            "debug",
            `NPSMsg response object from _npsValidatePersonaName',
      ${JSON.stringify({
          NPSMsg: responsePacket.toJSON(),
      })}`
        );
        responsePacket.dumpPacket();

        this.#log(
            "debug",
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
    sendPacket(socket: import('node:net').Socket, packet: NPSMessage): void {
        try {
            // deepcode ignore WrongNumberOfArgs: False alert
            socket.write(packet.serialize());
        } catch (error) {
            if (error instanceof Error) {
                const err = new TypeError(
                    `Unable to send packet: ${error.message}`
                );
                Sentry.addBreadcrumb({ level: "error", message: err.message });
                throw err;
            }

            const err = new Error("Unable to send packet, error unknown");
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            throw err;
        }
    }

    /**
     *
     * @param {number} customerId
     * @return {Promise<PersonaRecord[]>}
     */
    async getPersonasByCustomerId(customerId: number): Promise<TPersonaRecord[]> {
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
    async getPersonaMapsByCustomerId(customerId: number): Promise<TPersonaRecord[]> {
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
        this.#log("debug", "_npsGetPersonaMaps...");
        const requestPacket = new NPSMessage("received").deserialize(data);

        this.#log(
            "debug",
            `NPSMsg request object from _npsGetPersonaMaps',
      ${JSON.stringify({
          NPSMsg: requestPacket.toJSON(),
      })}`
        );
        this.#log(
            "debug",
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
        this.#log(
            "debug",
            `${personas.length} personas found for ${customerId.readUInt32BE(
                0
            )}`
        );

        const personaMapsMessage = new NPSPersonaMapsMessage("sent");

        if (personas.length === 0) {
            const err = new Error(
                `No personas found for customer Id: ${customerId.readUInt32BE(
                    0
                )}`
            );
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            throw err;
        } else {
            try {
                personaMapsMessage.loadMaps(personas);

                const responsePacket = new NPSMessage("sent");
                responsePacket.msgNo = 0x6_07;
                responsePacket.setContent(personaMapsMessage.serialize());
                this.#log(
                    "debug",
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
                    const err = new TypeError(
                        `Error serializing personaMapsMsg: ${error.message}`
                    );
                    Sentry.addBreadcrumb({
                        level: "error",
                        message: err.message,
                    });
                    throw err;
                }

                const err = new Error(
                    "Error serializing personaMapsMsg, error unknonw"
                );
                Sentry.addBreadcrumb({ level: "error", message: err.message });
                throw err;
            }
        }
    }
}

/**
 * Entry and exit point for the persona service
 *
 * @export
 * @param {import("mcos/shared").TBufferWithConnection} dataConnection
 * @param {import("mcos/shared").TServerConfiguration} config
 * @param {import("mcos/shared").TServerLogger} log
 * @return {Promise<import("mcos/shared").TServiceResponse>}
 */
export async function receivePersonaData(dataConnection: import("mcos/shared").TBufferWithConnection, config: import("mcos/shared").TServerConfiguration, log: import("mcos/shared").TServerLogger): Promise<import("mcos/shared").TServiceResponse> {
    try {
        return await handleData(dataConnection, log);
    } catch (error) {
        const err = new Error(
            `There was an error in the persona service: ${String(error)}`
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }
}


