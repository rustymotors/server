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

import type { PersonaRecord } from "../persona/PersonaRecord.js";

/**
 * All personas
 * NOTE: Currently we only support one persona per customer
 * TODO: Store in a database, instead of being hard-coded
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
        {
            customerId: 6,
            personaId: 1,
            personaName: 'Enistein',
            shardId: 44,
        },
    ];

/**
 * Return string as buffer
 */
export function generateNameBuffer(name: string, size: number): Buffer {
    const nameBuffer = Buffer.alloc(size);
    Buffer.from(name, 'utf8').copy(nameBuffer);
    return nameBuffer;
}

export function personaToString(
    persona: Pick<
        PersonaRecord,
        'customerId' | 'personaId' | 'personaName' | 'shardId'
    >,
): string {
    return ''.concat(
        `PersonaRecord: customerId=${persona.customerId}, `,
        `personaId=${persona.personaId}, `,
        `name=${persona.personaName}, `,
        `shardId=${persona.shardId}`,
    );
}
