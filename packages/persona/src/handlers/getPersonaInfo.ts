import { LegacyMessage, NPSMessage, SerializedBufferOld, ServerLogger  } from "rusty-motors-shared";
import { getPersonasByPersonaId } from "../getPersonasByPersonaId.js";
import { personaToString } from "../internal.js";

import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("PersonaServer");

/**
 * Retrieves persona information based on the provided connection ID and message.
 *
 * @param params - The parameters required to fetch persona information.
 * @param params.connectionId - The unique identifier for the connection.
 * @param params.message - The legacy message containing the request data.
 * @param params.log - Optional logger instance for debugging (defaults to `defaultLogger`).
 * 
 * @returns A promise that resolves to an object containing:
 * - `connectionId`: The same connection ID passed in the request.
 * - `messages`: An array of serialized buffer messages containing the persona information.
 * 
 * @throws Will throw an error if the persona cannot be found for the given persona ID.
 */
export async function getPersonaInfo({
	connectionId,
	message,
	log = defaultLogger,
}: {
	connectionId: string;
	message: LegacyMessage;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	messages: SerializedBufferOld[];
}> {
	log.debug("getPersonaInfo...");
	const requestPacket = new NPSMessage();
    requestPacket.deserialize(message.serialize());

	log.debug(
		`LegacyMsg request object from getPersonaInfo ${requestPacket.toString()}`,
	);

    const personaId = requestPacket.data.readUInt32BE(0);

    log.debug(`personaId: ${personaId}`);

    const persona = await getPersonasByPersonaId({
        personaId,
    });

    if (!persona[0]) {
        throw new Error(`Persona not found for personaId: ${personaId}`);
    }

	log.debug(`Persona found: ${personaToString(persona[0])}`);

    const profgamemessageile = createGameProfile();

    profile.customerId = persona[0]!.customerId;
    profile.profileId = persona[0]!.personaId;
    profile.profileName = persona[0]!.personaName;

	// Build the packet
	// Response Code
	// 0x607 = Game Persona Info
	const responsePacket = new LegacyMessage();
	responsePacket._header.id = 0x607;
	responsePacket.setBuffer(profile.serialize());
	log.debug(
		`LegacyMsg response object from getPersonaInfo ${responsePacket
			.serialize()
			.toString("hex")} `,
	);

	const outboundMessage = new SerializedBufferOld();
	outboundMessage.setBuffer(responsePacket.serialize());

	return {
		connectionId,
		messages: [outboundMessage],
	};
}
