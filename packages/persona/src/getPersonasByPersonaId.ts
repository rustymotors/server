import { getServerLogger, ServerLogger } from "rusty-motors-shared";
import { personaRecords } from "./internal.js";
import type { PersonaRecord } from "./PersonaMapsMessage.js";

export async function getPersonaByPersonaId({
	personaId,
	logger = getServerLogger('getPersonaByPersonaId')
}: {
	personaId: number;
	logger?: ServerLogger
}): Promise<Pick<
	PersonaRecord,
	"customerId" | "personaId" | "personaName" | "shardId"
> | undefined> {
	const result = personaRecords.find((persona) => {
		const match = personaId === persona.personaId;
		return match;
	});
	if (typeof result === "undefined") {
		logger.warn(`Unable to locate a persona for id: ${personaId}`);
		return result
	}

	return result;
}
