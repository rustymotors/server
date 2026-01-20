import { NoResultsError, type ServerLogger } from "rusty-motors-shared";
import { personaRecords } from "./internal.js";
import type { PersonaRecord } from "./PersonaMapsMessage.js";

export async function getPersonaByPersonaId({
	personaId,
}: {
	personaId: number;
	logger?: ServerLogger
}): Promise<Pick<
	PersonaRecord,
	"customerId" | "personaId" | "personaName" | "shardId"
>> {
	const result = personaRecords.find((persona) => {
		const match = personaId === persona.personaId;
		return match;
	});
	if (typeof result === "undefined") {
		throw new NoResultsError(`Unable to locate a persona for id: ${personaId}`)
	}

	return result;
}
