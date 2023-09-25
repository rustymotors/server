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

import { NPSMessage } from "../../shared/NPSMessage.js";
import { getServerLogger } from "../../shared/log.js";
import { MessagePacket } from "../../lobby/src/MessagePacket.js";
import { NPSPersonaMapsMessage } from "./NPSPersonaMapsMessage.js";
import { Buffer } from "node:buffer";
import { ServerError } from "../../shared/errors/ServerError.js";
import { RawMessage } from "../../shared/RawMessage.js";
import { RawMessageHeader } from "../../shared/RawMessageHeader.js";
import {
    PersonaList,
    PersonaMapsMessage,
    PersonaRecord,
} from "./PersonaMapsMessage.js";
import { getServerConfiguration } from "../../shared/Configuration.js";

const NAME_BUFFER_SIZE = 30;

/**
 * Array of supported message handlers
 *
 * @type {{
 *  opCode: number,
 * name: string,
 * handler: (args: {
 * connectionId: string,
 * message: RawMessage,
 * log: import("pino").Logger,
 * }) => Promise<{
 * connectionId: string,
 * messages: RawMessage[],
 * }>}[]}
 */
export const messageHandlers = [
    {
        opCode: 1283, // 0x503
        name: "Game login",
        handler: handleSelectGamePersona,
    },
    {
        opCode: 1295, // 0x50F
        name: "Game logout",
        handler: handleGameLogout,
    },
    {
        opCode: 1330, // 0x532
        name: "Get persona maps",
        handler: getPersonaMaps,
    },
];

/**
 * Return string as buffer
 * @param {string} name
 * @param {number} size
 * @param {BufferEncoding} [encoding="utf8"]
 * @returns {Buffer}
 */
export function generateNameBuffer(name, size, encoding = "utf8") {
    const nameBuffer = Buffer.alloc(size);
    Buffer.from(name, encoding).copy(nameBuffer);
    return nameBuffer;
}

/**
 * All personas
 * NOTE: Currently we only support one persona per customer
 * @type {import("../../interfaces/index.js").PersonaRecord[]}
 */
export const personaRecords = [
    {
        customerId: 2868969472,
        id: Buffer.from([0x00, 0x00, 0x00, 0x01]),
        maxPersonas: Buffer.from([0x01]),
        name: generateNameBuffer("Doc Joe", NAME_BUFFER_SIZE),
        personaCount: Buffer.from([0x00, 0x01]),
        shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c]),
    },
    {
        customerId: 5551212, // 0x54 0xB4 0x6C
        id: Buffer.from([0x00, 0x84, 0x5f, 0xed]),
        maxPersonas: Buffer.from([0x02]),
        name: generateNameBuffer("Dr Brown", NAME_BUFFER_SIZE),
        personaCount: Buffer.from([0x00, 0x01]),
        shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c]),
    },
];

/**
 *
 * @param {number} id
 * @return {Promise<import("../../interfaces/index.js").PersonaRecord[]>}
 */
export async function getPersonasByPersonaId(id) {
    const results = personaRecords.filter((persona) => {
        const match = id === persona.id.readInt32BE(0);
        return match;
    });
    if (results.length === 0) {
        const err = new Error(`Unable to locate a persona for id: ${id}`);
        throw err;
    }

    return results;
}

/**
 * Selects a game persona and marks it as in use
 * @param {object} args
 * @param {string} args.connectionId
 * @param {RawMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "LoginServer" })]
 * @returns {Promise<{
 *  connectionId: string,
 * messages: RawMessage[],
 * }>}
 */
export async function handleSelectGamePersona({
    connectionId,
    message,
    log = getServerLogger({
        module: "PersonaServer",
    }),
}) {
    log.debug("_npsSelectGamePersona...");
    const requestPacket = message;
    log.debug(
        `NPSMsg request object from _npsSelectGamePersona: ${JSON.stringify({
            NPSMsg: requestPacket.toString(),
        })}`,
    );

    // Create the packet content
    const packetContent = Buffer.alloc(251);

    // Build the packet
    // Response Code
    // 207 = success
    const responsePacket = new NPSMessage();
    responsePacket.msgNo = 0x207;
    responsePacket.setContent(packetContent);
    log.debug(
        `NPSMsg response object from _npsSelectGamePersona',
    ${JSON.stringify({
        NPSMsg: responsePacket.toString(),
    })}`,
    );

    const outboundMessage = RawMessage.fromNPSMessage(responsePacket);

    return {
        connectionId,
        messages: [outboundMessage],
    };
}

/**
 * Handle game logout
 * @param {object} args
 * @param {string} args.connectionId
 * @param {RawMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "LoginServer" })]
 * @returns {Promise<{
 *  connectionId: string,
 * messages: RawMessage[],
 * }>}
 */
export async function handleGameLogout({
    connectionId,
    message,
    log = getServerLogger({
        module: "PersonaServer",
    }),
}) {
    log.debug("_npsLogoutGameUser...");
    const requestPacket = message;
    log.debug(
        `NPSMsg request object from _npsLogoutGameUser',
      ${JSON.stringify({
          NPSMsg: requestPacket.toString(),
      })}`,
    );

    // Create the packet content
    const packetContent = Buffer.alloc(257);

    // Build the packet
    const responsePacket = new NPSMessage();
    responsePacket.msgNo = 0x207;
    log.debug(
        `NPSMsg response object from _npsLogoutGameUser',
      ${JSON.stringify({
          NPSMsg: responsePacket.toString(),
      })}`,
    );

    const outboundMessage = RawMessage.fromNPSMessage(responsePacket);

    return {
        connectionId,
        messages: [outboundMessage],
    };
}

/**
 * Create a new game persona record
 *
 * @param {Buffer} data
 * @param {import("pino").Logger} log
 * @return {Promise<NPSMessage>}
 * @memberof PersonaServer
 */
async function createNewGameAccount(data, log) {
    const requestPacket = new NPSMessage().deserialize(data);
    log.debug(
        `NPSMsg request object from _npsNewGameAccount',
      ${JSON.stringify({
          NPSMsg: requestPacket.toString(),
      })}`,
    );

    const rPacket = new NPSMessage();
    rPacket.msgNo = 0x601;
    log.debug(
        `NPSMsg response object from _npsNewGameAccount',
      ${JSON.stringify({
          NPSMsg: rPacket.toString(),
      })}`,
    );

    return rPacket;
}

//  * TODO: Change the persona record to show logged out. This requires it to exist first, it is currently hard-coded
//  * TODO: Locate the connection and delete, or reset it.
/**
 * Log out a game persona
 *
 * @param {Buffer} data
 * @param {import("pino").Logger} log
 * @return {Promise<NPSMessage>}
 * @memberof PersonaServer
 */
async function logoutGameUser(data, log) {
    log.debug("[personaServer] Logging out persona...");
    const requestPacket = new NPSMessage().deserialize(data);
    log.debug(
        `NPSMsg request object from _npsLogoutGameUser',
      ${JSON.stringify({
          NPSMsg: requestPacket.toString(),
      })}`,
    );

    // Create the packet content
    const packetContent = Buffer.alloc(257);

    // Build the packet
    const responsePacket = new NPSMessage();
    responsePacket.msgNo = 0x612;
    responsePacket.setContent(packetContent);
    log.debug(
        `NPSMsg response object from _npsLogoutGameUser',
      ${JSON.stringify({
          NPSMsg: responsePacket.toString(),
      })}`,
    );
    return responsePacket;
}

/**
 *
 * @param {number} customerId
//  * @return {Promise<import("../../interfaces/index.js").PersonaRecord[]>}
 */
async function getPersonasByCustomerId(customerId) {
    const results = personaRecords.filter(
        (persona) => persona.customerId === customerId,
    );
    return results;
}

/**
 * Lookup all personas owned by the customer id
 *
 * TODO: Store in a database, instead of being hard-coded
 *
 * @param {number} customerId
 * @return {Promise<import("../../interfaces/index.js").PersonaRecord[]>}
 */
async function getPersonaMapsByCustomerId(customerId) {
    switch (customerId) {
        case 2868969472:
        case 5551212:
            return getPersonasByCustomerId(customerId);
        default:
            return [];
    }
}

/**
 * Handle a get persona maps packet
 * @param {object} args
 * @param {string} args.connectionId
 * @param {RawMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "LoginServer" })]
 * @returns {Promise<{
 *  connectionId: string,
 * messages: RawMessage[],
 * }>}
 */
async function getPersonaMaps({
    connectionId,
    message,
    log = getServerLogger({ module: "PersonaServer" }),
}) {
    log.debug("_npsGetPersonaMaps...");
    const data = message.raw;
    const requestPacket = new NPSMessage().deserialize(data);

    log.debug(
        `NPSMsg request object from _npsGetPersonaMaps',
      ${JSON.stringify({
          NPSMsg: requestPacket.toString(),
      })}`,
    );
    const customerId = Buffer.alloc(4);
    data.copy(customerId, 0, 12);
    const personas = await getPersonaMapsByCustomerId(
        customerId.readUInt32BE(0),
    );
    log.debug(
        `${personas.length} personas found for ${customerId.readUInt32BE(0)}`,
    );

    const personaMapsMessage = new PersonaMapsMessage();

    // this is a GLDP_PersonaList::GLDP_PersonaList

    if (personas.length === 0) {
        const err = new Error(
            `No personas found for customer Id: ${customerId.readUInt32BE(0)}`,
        );
        throw err;
    } else {
        try {
            /** @type {PersonaList} */
            let personaList = new PersonaList();

            if (personas.length > 1) {
                log.warn(
                    `More than one persona found for customer Id: ${customerId.readUInt32BE(
                        0,
                    )}`,
                );
            }

            personas.forEach((persona) => {
                const personaRecord = new PersonaRecord();

                personaRecord.customerId = persona.customerId;
                personaRecord.personaId = persona.id.readUInt32BE(0);
                personaRecord.personaName = persona.name.toString("utf8");
                personaRecord.shardId = persona.shardId.readUInt32BE(0);
                personaRecord.numberOfGames = personas.length;

                personaList.addPersonaRecord(personaRecord);

                log.debug(
                    `Persona record: ${JSON.stringify({
                        personaRecord: personaRecord.toJSON(),
                    })}`,
                );
            });

            personaMapsMessage._header.id = 0x607;
            personaMapsMessage._personaRecords = personaList;
            personaMapsMessage.data = personaList.serialize();
            personaMapsMessage._header.length =
                personaMapsMessage.data.length + RawMessageHeader.size();

            log.debug(
                `PersonaMapsMessage object from _npsGetPersonaMaps',
            ${JSON.stringify({
                personaMapsMessage: personaMapsMessage.toString(),
            })}`,
            );

            return {
                connectionId,
                messages: [personaMapsMessage],
            };
        } catch (error) {
            if (error instanceof Error) {
                const err = new ServerError(
                    `Error serializing personaMapsMsg: ${error.message}`,
                );
                throw err;
            }

            const err = new Error(
                "Error serializing personaMapsMsg, error unknonw",
            );
            throw err;
        }
    }
}

/**
 * Check if valid name for new user
 *
 * @param {Buffer} data
 * @param {import("pino").Logger} log
 * @return {Promise<NPSMessage>}
 */
async function validatePersonaName(data, log) {
    log.debug("_npsValidatePersonaName...");
    const requestPacket = new NPSMessage().deserialize(data);

    log.debug(
        `NPSMsg request object from _npsValidatePersonaName',
    ${JSON.stringify({
        NPSMsg: requestPacket.toString(),
    })}`,
    );

    const customerId = data.readInt32BE(12);
    const requestedPersonaName = data
        .subarray(18, data.lastIndexOf(0x00))
        .toString();
    const serviceName = data.subarray(data.indexOf(0x0a) + 1).toString(); // skipcq: JS-0377
    log.debug(
        JSON.stringify({ customerId, requestedPersonaName, serviceName }),
    );

    // Create the packet content
    // TODO: #1178 Return the validate persona name response as a MessagePacket object

    const packetContent = Buffer.alloc(256);

    // Build the packet
    // NPS_USER_VALID     validation succeeded
    const responsePacket = new NPSMessage();
    responsePacket.msgNo = 0x601;
    responsePacket.setContent(packetContent);

    log.debug(
        `[npsValidatePersonaName] responsePacket's data prior to sending: ${responsePacket.toString()}`,
    );
    return responsePacket;
}

/**
 * Handle a check token packet
 *
 * @param {Buffer} data
 * @param {import("pino").Logger} log
 * @return {Promise<NPSMessage>}
 * @memberof PersonaServer
 */
async function validateLicencePlate(data, log) {
    log.debug("_npsCheckToken...");
    const requestPacket = new NPSMessage().deserialize(data);
    log.debug(
        `NPSMsg request object from _npsCheckToken',
      ${JSON.stringify({
          NPSMsg: requestPacket.toString(),
      })}`,
    );

    const customerId = data.readInt32BE(12);
    const plateName = data.subarray(17).toString();
    log.debug(`customerId: ${customerId}`); // skipcq: JS-0378
    log.debug(`Plate name: ${plateName}`); // skipcq: JS-0378

    // Create the packet content

    const packetContent = Buffer.alloc(256);

    // Build the packet
    // NPS_ACK = 207
    const responsePacket = new NPSMessage();
    responsePacket.msgNo = 0x207;
    responsePacket.setContent(packetContent);

    log.debug(
        `NPSMsg response object from _npsCheckToken',
        ${JSON.stringify({
            NPSMsg: responsePacket.toString(),
        })}`,
    );

    return responsePacket;
}

/**
 *
 *
 * @param {object} args
 * @param {string} args.connectionId
 * @param {RawMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "PersonaServer" })]
 * @returns {Promise<{
 *  connectionId: string,
 * messages: RawMessage[],
 * }>}
 * @throws {Error} Unknown code was received
 */
export async function receivePersonaData({
    connectionId,
    message,
    log = getServerLogger({
        module: "PersonaServer",
    }),
}) {
    log.level = getServerConfiguration({}).logLevel ?? "info";
    const { data } = message;
    log.debug(
        `Received Persona packet',
    ${JSON.stringify({
        data: data.toString("hex"),
    })}`,
    );

    const supportedHandler = messageHandlers.find((h) => {
        return h.opCode === message._header.id;
    });

    if (typeof supportedHandler === "undefined") {
        // We do not yet support this message code
        throw new ServerError(`UNSUPPORTED_MESSAGECODE: ${message._header.id}`);
    }

    try {
        const result = await supportedHandler.handler({
            connectionId,
            message,
            log,
        });
        log.debug(`Returning with ${result.messages.length} messages`);
        log.debug("Leaving receivePersonaDatadleData");
        return result;
    } catch (error) {
        throw new Error(`Error handling persona data: ${String(error)}`);
    }
}
