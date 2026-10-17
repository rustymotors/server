import { PersonaRecord } from "./PersonaRecord.js";

/**
 * All personas
 * NOTE: Currently we only support one persona per customer
 * @type {PersonaRecord[]}
 */

export const personaRecords: Pick<
    PersonaRecord, 'customerId' | 'personaId' | 'personaName' | 'shardId'
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
