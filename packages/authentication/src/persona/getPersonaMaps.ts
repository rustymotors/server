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

import type { ServerLogger, LegacyMessage } from 'rusty-motors-shared';
import { BytableBuffer } from '@rustymotors/binary';
import {
    PersonaList,
    PersonaMapsMessage,
} from './PersonaMapsMessage.js';
import { PersonaRecord } from "./PersonaRecord.js";
import { getServerLogger } from 'rusty-motors-shared';
import { personaRecords } from '../shared/personaRecords.js';

/**
 *
 * @param {number} customerId
//  * @return {Promise<PersonaRecord[]>}
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
 * Lookup all personas owned by the customer id
 *
 * TODO: Store in a database, instead of being hard-coded
 *
 * @param {number} customerId
 * @return {Promise<PersonaRecord[]>}
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
 * Handle a get persona maps packet
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {ServerLogger} [args.log=getServerLogger({ name: "LoginServer" })]
 * @returns {Promise<{
 *  connectionId: string,
 * messages: BytableBuffer[],
 * }>}
 */
export async function getPersonaMaps({
    connectionId,
    message,
    log = getServerLogger('PersonaServer/_getPersonaMaps'),
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: BytableBuffer[];
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
        const personaList: PersonaList = new PersonaList();

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
        personaMapsMessage.setBuffer(personaList.serialize());
        log.debug(
            `PersonaMapsMessage object from _npsGetPersonaMaps',
            ${JSON.stringify({
                personaMapsMessage: personaMapsMessage
                    .serialize()
                    .toString('hex'),
            })}`,
        );

        const outboundMessage = new BytableBuffer();
        outboundMessage.deserialize(personaMapsMessage.serialize());

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
