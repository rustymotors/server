import { personaRecords } from "./internal.js";
import type { PersonaRecord } from "./PersonaMapsMessage.js";

/**
 * Retrieves personas based on the provided persona ID.
 *
 * @param params - The parameters required to fetch personas.
 * @param params.personaId - The unique identifier for the persona.
 *
 * @returns A promise that resolves to an array of persona records matching the given persona ID.
 */
export async function getPersonasByPersonaId({
	personaId
}: {
	personaId: number;
}): Promise<Pick<
PersonaRecord,
"customerId" | "personaId" | "personaName" | "shardId"
>[]> {
	return personaRecords.filter((persona) => {
		const match = personaId === persona.personaId;
		return match;
	});
}
