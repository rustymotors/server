import { personaRecords } from "./internal.js";
import type { PersonaRecord } from "./PersonaMapsMessage.js";

export async function getPersonasByPersonaId({
	personaId
}: {
	personaId: number;
}): Promise<Pick<
PersonaRecord,
"customerId" | "personaId" | "personaName" | "shardId"
>[]> {
	const results = personaRecords.filter((persona) => {
		const match = personaId === persona.personaId;
		return match;
	});
	if (results.length === 0) {
		const err = Error(`Unable to locate a persona for id: ${personaId}`);
		throw err;
	}

	return results;
}
