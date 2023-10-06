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

import { getServerLogger } from "../../shared/log.js";
import { Buffer } from "node:buffer";
import { ServerError } from "../../shared/errors/ServerError.js";

import {
    PersonaList,
    PersonaMapsMessage,
    PersonaRecord,
} from "./PersonaMapsMessage.js";
import { getServerConfiguration } from "../../shared/Configuration.js";
import {
    LegacyMessage,
    SerializedBuffer,
} from "../../shared/messageFactory.js";

const NAME_BUFFER_SIZE = 30;

/**
 * Array of supported message handlers
 *
 * @type {{
 *  opCode: number,
 * name: string,
 * handler: (args: {
 * connectionId: string,
 * message: LegacyMessage,
 * log: import("pino").Logger,
 * }) => Promise<{
 * connectionId: string,
 * messages: SerializedBuffer[],
 * }>}[]}
 */
export const messageHandlers: {
    opCode: number;
    name: string;
    handler: (args: {
        connectionId: string;
        message: LegacyMessage;
        log: import("pino").Logger;
    }) => Promise<{
        connectionId: string;
        messages: SerializedBuffer[];
    }>;
}[] = [
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
export function generateNameBuffer(
    name: string,
    size: number,
    encoding: BufferEncoding = "utf8",
): Buffer {
    const nameBuffer = Buffer.alloc(size);
    Buffer.from(name, encoding).copy(nameBuffer);
    return nameBuffer;
}

/**
 * All personas
 * NOTE: Currently we only support one persona per customer
 * @type {import("../../interfaces/index.js").PersonaRecord[]}
 */
export const personaRecords: import("../../interfaces/index.js").PersonaRecord[] =
    [
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
export async function getPersonasByPersonaId(
    id: number,
): Promise<import("../../interfaces/index.js").PersonaRecord[]> {
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
 * @param {LegacyMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "LoginServer" })]
 * @returns {Promise<{
 *  connectionId: string,
 * messages: SerializedBuffer[],
 * }>}
 */
export async function handleSelectGamePersona({
    connectionId,
    message,
    log = getServerLogger({
        module: "PersonaServer",
    }),
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: import("pino").Logger;
}): Promise<{
    connectionId: string;
    messages: SerializedBuffer[];
}> {
    log.debug("_npsSelectGamePersona...");
    const requestPacket = message;
    log.debug(
        `LegacyMsg request object from _npsSelectGamePersona ${requestPacket
            ._doSerialize()
            .toString("hex")}`,
    );

    // Create the packet content
    const packetContent = Buffer.alloc(251);

    // Build the packet
    // Response Code
    // 207 = success
    const responsePacket = new LegacyMessage();
    responsePacket._header.id = 0x207;
    responsePacket.setBuffer(packetContent);
    log.debug(
        `LegacyMsg response object from _npsSelectGamePersona ${responsePacket
            ._doSerialize()
            .toString("hex")} `,
    );

    const outboundMessage = new SerializedBuffer();
    outboundMessage.setBuffer(responsePacket._doSerialize());

    return {
        connectionId,
        messages: [outboundMessage],
    };
}

/**
 * Handle game logout
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "LoginServer" })]
 * @returns {Promise<{
 *  connectionId: string,
 * messages: SerializedBuffer[],
 * }>}
 */
export async function handleGameLogout({
    connectionId,
    message,
    log = getServerLogger({
        module: "PersonaServer",
    }),
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: import("pino").Logger;
}): Promise<{
    connectionId: string;
    messages: SerializedBuffer[];
}> {
    log.debug("_npsLogoutGameUser...");
    const requestPacket = message;
    log.debug(
        `NPSMsg request object from _npsLogoutGameUser',
      ${JSON.stringify({
          NPSMsg: requestPacket.toString(),
      })}`,
    );

    // Build the packet
    const responsePacket = new LegacyMessage();
    responsePacket._header.id = 0x207;
    log.debug(
        `NPSMsg response object from _npsLogoutGameUser',
      ${JSON.stringify({
          NPSMsg: responsePacket.toString(),
      })}`,
    );

    const outboundMessage = new SerializedBuffer();
    outboundMessage._doDeserialize(responsePacket._doSerialize());

    return {
        connectionId,
        messages: [outboundMessage],
    };
}

/**
 *
 * @param {number} customerId
//  * @return {Promise<import("../../interfaces/index.js").PersonaRecord[]>}
 */
async function getPersonasByCustomerId(
    customerId: number,
): Promise<import("../../interfaces/index.js").PersonaRecord[]> {
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
async function getPersonaMapsByCustomerId(
    customerId: number,
): Promise<import("../../interfaces/index.js").PersonaRecord[]> {
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
 * @param {LegacyMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "LoginServer" })]
 * @returns {Promise<{
 *  connectionId: string,
 * messages: SerializedBuffer[],
 * }>}
 */
async function getPersonaMaps({
    connectionId,
    message,
    log = getServerLogger({ module: "PersonaServer" }),
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: import("pino").Logger;
}): Promise<{
    connectionId: string;
    messages: SerializedBuffer[];
}> {
    log.debug("_npsGetPersonaMaps...");

    const requestPacket = message;
    log.debug(
        `NPSMsg request object from _npsGetPersonaMaps ${requestPacket
            ._doSerialize()
            .toString("hex")} `,
    );

    const customerId = requestPacket.data.readUInt32BE(8);

    const personas = await getPersonaMapsByCustomerId(customerId);
    log.debug(`${personas.length} personas found for ${customerId}`);

    const personaMapsMessage = new PersonaMapsMessage();

    // this is a GLDP_PersonaList::GLDP_PersonaList

    if (personas.length === 0) {
        const err = new Error(
            `No personas found for customer Id: ${customerId}`,
        );
        throw err;
    } else {
        try {
            /** @type {PersonaList} */
            let personaList: PersonaList = new PersonaList();

            if (personas.length > 1) {
                log.warn(
                    `More than one persona found for customer Id: ${customerId}`,
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
            personaMapsMessage.setBuffer(personaList.serialize());
            log.debug(
                `PersonaMapsMessage object from _npsGetPersonaMaps',
            ${JSON.stringify({
                personaMapsMessage: personaMapsMessage
                    .serialize()
                    .toString("hex"),
            })}`,
            );

            const outboundMessage = new SerializedBuffer();
            outboundMessage._doDeserialize(personaMapsMessage.serialize());

            return {
                connectionId,
                messages: [outboundMessage],
            };
        } catch (error) {
            if (error instanceof Error) {
                const err = new ServerError(
                    `Error serializing personaMapsMsg: ${error.message}`,
                );
                throw err;
            }

            const err = new ServerError(
                "Error serializing personaMapsMsg, error unknonw",
            );
            throw err;
        }
    }
}

/**
 *
 *
 * @param {object} args
 * @param {string} args.connectionId
 * @param {SerializedBuffer} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "PersonaServer" })]
 * @returns {Promise<{
 *  connectionId: string,
 * messages: SerializedBuffer[],
 * }>}
 * @throws {Error} Unknown code was received
 */
export async function receivePersonaData({
    connectionId,
    message,
    log = getServerLogger({
        module: "PersonaServer",
    }),
}: {
    connectionId: string;
    message: SerializedBuffer;
    log?: import("pino").Logger;
}): Promise<{
    connectionId: string;
    messages: SerializedBuffer[];
}> {
    log.level = getServerConfiguration({}).logLevel ?? "info";
    const { data } = message;
    log.debug(
        `Received Persona packet',
    ${JSON.stringify({
        data: data.toString("hex"),
    })}`,
    );

    // The packet needs to be an NPSMessage
    const inboundMessage = new LegacyMessage();
    inboundMessage._doDeserialize(message.data);

    const supportedHandler = messageHandlers.find((h) => {
        return h.opCode === inboundMessage._header.id;
    });

    if (typeof supportedHandler === "undefined") {
        // We do not yet support this message code
        throw new ServerError(
            `UNSUPPORTED_MESSAGECODE: ${inboundMessage._header.id}`,
        );
    }

    try {
        const result = await supportedHandler.handler({
            connectionId,
            message: inboundMessage,
            log,
        });
        log.debug(`Returning with ${result.messages.length} messages`);
        log.debug("Leaving receivePersonaDatadleData");
        return result;
    } catch (error) {
        throw ServerError.fromUnknown(
            error,
            `Error handling persona data: ${String(error)}`,
        );
    }
}
