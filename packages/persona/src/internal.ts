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

import { SerializedBufferOld, ServerLogger } from 'rusty-motors-shared';
import { LegacyMessage } from 'rusty-motors-shared';
import {
    PersonaList,
    PersonaMapsMessage,
    PersonaRecord,
} from './PersonaMapsMessage.js';
import { _gameLogout } from './_gameLogout.js';
import { _getFirstBuddy } from './_getFirstBuddy.js';
import { _selectGamePersona } from './_selectGamePersona.js';
import { validatePersonaName } from './handlers/validatePersonaName.js';
import { getPersonaInfo } from './handlers/getPersonaInfo.js';
import { getServerLogger } from 'rusty-motors-shared';

/**
 * Array of supported message handlers
 *
 * @type {{
 *  opCode: number,
 * name: string,
 * handler: (args: {
 * connectionId: string,
 * message: LegacyMessage,
 * log: ServerLogger,
 * }) => Promise<{
 * connectionId: string,
 * messages: SerializedBufferOld[],
 * }>}[]}
 */
export const messageHandlers: {
    opCode: number;
    name: string;
    handler: (args: {
        connectionId: string;
        message: LegacyMessage;
        log: ServerLogger;
    }) => Promise<{
        connectionId: string;
        messages: SerializedBufferOld[];
    }>;
}[] = [
    {
        opCode: 1283, // 0x503
        name: 'Game login',
        handler: _selectGamePersona,
    },
    {
        opCode: 1295, // 0x50F
        name: 'Game logout',
        handler: _gameLogout,
    },
    {
        opCode: 1305, // 0x519
        name: 'Get persona info',
        handler: getPersonaInfo,
    },
    {
        opCode: 1330, // 0x532
        name: 'Get persona maps',
        handler: getPersonaMaps,
    },
    {
        opCode: 1331, // 0x533
        name: 'Validate persona name',
        handler: validatePersonaName,
    },
    {
        opCode: 1291, // 0x50B
        name: 'Get first buddy',
        handler: _getFirstBuddy,
    },
];

/**
 * Creates a fixed-size buffer containing the UTF-8 encoded bytes of a string.
 *
 * The resulting buffer will be exactly {@link size} bytes long, with the string's bytes at the start and any remaining space zero-filled.
 *
 * @param name - The string to encode into the buffer.
 * @param size - The desired length of the output buffer.
 * @returns A buffer of length {@link size} containing the encoded string.
 */
export function generateNameBuffer(name: string, size: number): Buffer {
    const nameBuffer = Buffer.alloc(size);
    Buffer.from(name, 'utf8').copy(nameBuffer);
    return nameBuffer;
}

/**
 * All personas
 * NOTE: Currently we only support one persona per customer
 * @type {PersonaRecord[]}
 */
export const personaRecords: Pick<
    PersonaRecord,
    'customerId' | 'personaId' | 'personaName' | 'shardId'
>[] = [
    {
        customerId: 2868969472,
        personaId: 20,
        personaName: 'Molly',
        shardId: 44,
    },
    {
        customerId: 5551212, // 0x54 0xB4 0x6C
        personaId: 21,
        personaName: 'Dr Brown',
        shardId: 44,
    },
    {
        customerId: 0,
        personaId: 22,
        personaName: 'Admin',
        shardId: 44,
    },
];

/**
 * Retrieves all persona records associated with the specified customer ID.
 *
 * @param customerId - The unique identifier of the customer whose personas are to be retrieved.
 * @returns A promise that resolves to an array of persona records for the given customer.
 */
async function getPersonasByCustomerId(
    customerId: number,
): Promise<
    Pick<
        PersonaRecord,
        'customerId' | 'personaId' | 'personaName' | 'shardId'
    >[]
> {
    const results = personaRecords.filter(
        (persona) => persona.customerId === customerId,
    );
    return results;
}

/**
 * Retrieves all persona records associated with the specified customer ID.
 *
 * Returns an array of persona records for the given {@link customerId}, or an empty array if none are found.
 *
 * @param customerId - The unique identifier of the customer whose personas are to be retrieved.
 * @returns A promise resolving to an array of persona records for the customer.
 *
 * @remark Only customer ID 5551212 is currently supported; all other IDs return an empty array.
 */
async function getPersonaMapsByCustomerId(
    customerId: number,
): Promise<
    Pick<
        PersonaRecord,
        'customerId' | 'personaId' | 'personaName' | 'shardId'
    >[]
> {
    switch (customerId) {
        case 5551212:
            return getPersonasByCustomerId(customerId);
        default:
            return [];
    }
}

/**
 * Processes a "Get persona maps" request and returns serialized persona data for a given customer.
 *
 * Extracts the customer ID from the incoming message, retrieves associated persona records, serializes them into a response message, and returns the result for network transmission.
 *
 * @param connectionId - The identifier for the client connection.
 * @param message - The incoming legacy message containing the request data.
 * @returns An object containing the connection ID and an array with the serialized persona maps message.
 *
 * @throws {Error} If serialization of the persona maps message fails.
 */
async function getPersonaMaps({
    connectionId,
    message,
    log = getServerLogger('PersonaServer/_getPersonaMaps'),
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: SerializedBufferOld[];
}> {
    log.debug('_npsGetPersonaMaps...');

    const requestPacket = message;
    log.debug(
        `NPSMsg request object from _npsGetPersonaMaps ${requestPacket
            ._doSerialize()
            .toString('hex')} `,
    );

    const customerId = requestPacket.data.readUInt32BE(8);

    const personas = await getPersonaMapsByCustomerId(customerId);
    log.debug(`${personas.length} personas found for ${customerId}`);

    const personaMapsMessage = new PersonaMapsMessage();

    // this is a GLDP_PersonaList::GLDP_PersonaList

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
            personaRecord.personaId = persona.personaId;
            personaRecord.personaName = persona.personaName;
            personaRecord.shardId = persona.shardId;
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
        personaMapsMessage.setBody(personaList.serialize());
        log.debug(
            `PersonaMapsMessage object from _npsGetPersonaMaps',
            ${JSON.stringify({
                personaMapsMessage: personaMapsMessage
                    .serialize()
                    .toString('hex'),
            })}`,
        );

        const outboundMessage = new SerializedBufferOld();
        outboundMessage._doDeserialize(personaMapsMessage.serialize());

        return {
            connectionId,
            messages: [outboundMessage],
        };
    } catch (error) {
        const err = Error(`Error serializing personaMapsMsg`);
        err.cause = error;
        throw err;
    }
}

/**
 * Returns a formatted string representation of a persona record.
 *
 * @param persona - Partial persona record to format.
 * @returns A string displaying the {@link persona}'s customerId, personaId, personaName, and shardId.
 */
export function personaToString(persona: Partial<PersonaRecord>): string {
    return ''.concat(
        `PersonaRecord: customerId=${persona.customerId}, `,
        `personaId=${persona.personaId}, `,
        `name=${persona.personaName}, `,
        `shardId=${persona.shardId}`,
    );
}
