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

import { NPSPersonaMapsMessage } from "./NPSPersonaMapsMessage.js";
import { NPSMessage } from "../../mcos-gateway/src/NPSMessage.js";
import { MessagePacket } from "../../mcos-lobby/src/MessagePacket.js";

const NAME_BUFFER_SIZE = 30;

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
 * @type {import("./index.js").PersonaRecord[]}
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
        customerId: 5551212,
        id: Buffer.from([0x00, 0x84, 0x5f, 0xed]),
        maxPersonas: Buffer.from([0x02]),
        name: generateNameBuffer("Dr Brown", NAME_BUFFER_SIZE),
        personaCount: Buffer.from([0x00, 0x01]),
        shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c]),
    },
    {
        customerId: 5551212,
        id: Buffer.from([0x00, 0x84, 0x5f, 0xee]),
        maxPersonas: Buffer.from([0x02]),
        name: generateNameBuffer("Morty Dr", NAME_BUFFER_SIZE),
        personaCount: Buffer.from([0x00, 0x01]),
        shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c]),
    },
];

/**
 *
 * @param {number} id
 * @return {Promise<import("./index.js").PersonaRecord[]>}
 */
export async function getPersonasByPersonaId(id) {
    const results = personaRecords.filter((persona) => {
        const match = id === persona.id.readInt32BE(0);
        return match;
    });
    if (results.length === 0) {
        throw new Error(`Unable to locate a persona for id: ${id}`);
    }

    return Promise.resolve(results);
}

/**
 * Selects a game persona and marks it as in use
 * @param {NPSMessage} requestPacket
 * @param {import("mcos/shared").TServerLogger} log
 * @returns {Promise<NPSMessage>}
 */
export async function handleSelectGamePersona(requestPacket, log) {
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
    return Promise.resolve(responsePacket);
}

/**
 * Create a new game persona record
 *
 * @param {Buffer} data
 * @param {import("mcos/shared").TServerLogger} log
 * @return {Promise<NPSMessage>}
 * @memberof PersonaServer
 */
async function createNewGameAccount(data, log) {
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

    return Promise.resolve(rPacket);
}

//  * TODO: Change the persona record to show logged out. This requires it to exist first, it is currently hard-coded
//  * TODO: Locate the connection and delete, or reset it.
/**
 * Log out a game persona
 *
 * @param {Buffer} data
 * @param {import("mcos/shared").TServerLogger} log
 * @return {Promise<NPSMessage>}
 * @memberof PersonaServer
 */
async function logoutGameUser(data, log) {
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
    return Promise.resolve(responsePacket);
}

/**
 *
 * @param {number} customerId
 * @return {Promise<import("./index.js").PersonaRecord[]>}
 */
async function getPersonasByCustomerId(customerId) {
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
 * @return {Promise<import("./index.js").PersonaRecord[]>}
 */
async function getPersonaMapsByCustomerId(customerId) {
    switch (customerId) {
        case 2_868_969_472:
        case 5_551_212:
            return getPersonasByCustomerId(customerId);
        default:
            return [];
    }
}

/**
 * Handle a get persona maps packet
 * @param {Buffer} data
 * @param {import("mcos/shared").TServerLogger} log
 * @return {Promise<NPSMessage>}
 */
async function getPersonaMaps(data, log) {
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
    const personas = await getPersonaMapsByCustomerId(
        customerId.readUInt32BE(0)
    );
    log.info(
        `${personas.length} personas found for ${customerId.readUInt32BE(0)}`
    );

    const personaMapsMessage = new NPSPersonaMapsMessage("sent");

    // this is a GLDP_PersonaList::GLDP_PersonaList

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
            log.info(
                `NPSMsg response object from _npsGetPersonaMaps: ${JSON.stringify(
                    {
                        NPSMsg: responsePacket.toJSON(),
                    }
                )}`
            );

            responsePacket.dumpPacket();

            const personaMapsPacket = MessagePacket.fromBuffer(
                responsePacket.serialize()
            );

            log.info(
                `!!! outbound persona maps response packet: ${personaMapsPacket
                    .getBuffer()
                    .toString("hex")}`
            );

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
 * Check if valid name for new user
 *
 * @param {Buffer} data
 * @param {import("mcos/shared").TServerLogger} log
 * @return {Promise<NPSMessage>}
 */
async function validatePersonaName(data, log) {
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
    const serviceName = data.slice(data.indexOf(0x0a) + 1).toString(); // skipcq: JS-0377
    log.info(JSON.stringify({ customerId, requestedPersonaName, serviceName }));

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
    return Promise.resolve(responsePacket);
}

/**
 * Handle a check token packet
 *
 * @param {Buffer} data
 * @param {import("mcos/shared").TServerLogger} log
 * @return {Promise<NPSMessage>}
 * @memberof PersonaServer
 */
async function validateLicencePlate(data, log) {
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
    return Promise.resolve(responsePacket);
}

/**
 *
 *
 * @param {import("mcos/shared").TBufferWithConnection} dataConnection
 * @param {import("mcos/shared").TServerLogger} log
 * @return {Promise<import("mcos/shared").TMessageArrayWithConnection>}
 */
export async function handleData(dataConnection, log) {
    const { connection, data } = dataConnection;
    const { socket, localPort } = connection;
    log.info(
        `Received Persona packet',
    ${JSON.stringify({
        localPort,
        remoteAddress: socket.remoteAddress,
        data: data.toString("hex"),
    })}`
    );
    const requestCode = data.readUInt16BE(0).toString(16);

    switch (requestCode) {
        case "503": {
            const requestPacket = new NPSMessage("received").deserialize(data);
            // NPS_REGISTER_GAME_LOGIN = 0x503
            const responsePacket = await handleSelectGamePersona(
                requestPacket,
                log
            );
            /** @type {import("mcos/shared").TMessageArrayWithConnection} */
            const response = {
                connection: dataConnection.connection,
                messages: [responsePacket],
                log
            };
            return response;
        }

        case "507": {
            // NPS_NEW_GAME_ACCOUNT == 0x507
            const responsePacket = await createNewGameAccount(data, log);
            /** @type {import("mcos/shared").TMessageArrayWithConnection} */
            const response = {
                connection: dataConnection.connection,
                messages: [responsePacket],
                log
            };
            return response;
        }

        case "50f": {
            // NPS_REGISTER_GAME_LOGOUT = 0x50F
            const responsePacket = await logoutGameUser(data, log);
            /** @type {import("mcos/shared").TMessageArrayWithConnection} */
            const response = {
                connection: dataConnection.connection,
                messages: [responsePacket],
                log
            };
            return response;
        }

        case "532": {
            // NPS_GET_PERSONA_MAPS = 0x532
            const responsePacket = await getPersonaMaps(data, log);
            /** @type {import("mcos/shared").TMessageArrayWithConnection} */
            const response = {
                connection: dataConnection.connection,
                messages: [responsePacket],
                log
            };
            return response;
        }

        case "533": {
            // NPS_VALIDATE_PERSONA_NAME   = 0x533
            const responsePacket = await validatePersonaName(data, log);
            /** @type {import("mcos/shared").TMessageArrayWithConnection} */
            const response = {
                connection: dataConnection.connection,
                messages: [responsePacket],
                log
            };
            return response;
        }
        case "534": {
            // NPS_CHECK_TOKEN   = 0x534
            const responsePacket = await validateLicencePlate(data, log);
            /** @type {import("mcos/shared").TMessageArrayWithConnection} */
            const response = {
                connection: dataConnection.connection,
                messages: [responsePacket],
                log
            };
            return response;
        }
    }
    throw new Error(
        `[personaServer] Unknown code was received ${JSON.stringify({
            requestCode,
            localPort: socket.localPort,
        })}`
    );
}
