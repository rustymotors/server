import type { PersonaRecord } from "rusty-motors-shared";
import { personaRecords } from "./internal.js";

/**
 *
 * @param {number} id
 * @return {Promise<import("../../interfaces/index.js").PersonaRecord[]>}
 */

export async function getPersonasByPersonaId({
	id,
}: {
	id: number;
}): Promise<PersonaRecord[]> {
	const results = personaRecords.filter((persona) => {
		const match = id === persona.id.readInt32BE(0);
		return match;
	});
	if (results.length === 0) {
		const err = Error(`Unable to locate a persona for id: ${id}`);
		throw err;
	}

	return results;
}
