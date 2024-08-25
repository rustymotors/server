import { PersonaRecord } from "../../interfaces/index.js";
import { ServerError } from "../../shared/src/ServerError.js";
import { personaRecords } from "./internal.js";

/**
 *
 * @param {number} id
 * @return {Promise<import("../../interfaces/index.js").PersonaRecord[]>}
 */

export async function getPersonasByPersonaId({
    personas = personaRecords,
    id,
}: {
    personas?: PersonaRecord[];
    id: number;
}): Promise<import("../../interfaces/index.js").PersonaRecord[]> {
    const results = personaRecords.filter((persona) => {
        const match = id === persona.id.readInt32BE(0);
        return match;
    });
    if (results.length === 0) {
        const err = new ServerError(`Unable to locate a persona for id: ${id}`);
        throw err;
    }

    return results;
}
