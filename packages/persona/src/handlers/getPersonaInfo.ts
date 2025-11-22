import { LegacyMessage, NPSMessage, SerializedBufferOld, ServerLogger  } from "rusty-motors-shared";
import { createGameProfile } from "rusty-motors-nps";
import { getPersonaByPersonaId } from "../getPersonasByPersonaId.js";
import { personaToString } from "../internal.js";

import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("PersonaServer");

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
	log.verbose("getPersonaInfo...");
	const requestPacket = new NPSMessage();
    requestPacket.deserialize(message.serialize());

	log.verbose(
		`LegacyMsg request object from getPersonaInfo ${requestPacket.toString()}`,
	);

    const personaId = requestPacket.data.readUInt32BE(0);

    log.verbose(`personaId: ${personaId}`);

    const persona = await getPersonaByPersonaId({
        personaId,
    });

    if (typeof persona === "undefined") {
		const responsePacket = new LegacyMessage();
		responsePacket._header.id = 0x612; // no persona
		const outboundMessage = new SerializedBufferOld();
		outboundMessage.setBuffer(responsePacket._doSerialize());
		return {
			connectionId,
			messages: [outboundMessage]
		}
    }

	log.verbose(`Persona found: ${personaToString(persona)}`);

    const profile = createGameProfile();

    profile.customerId = persona.customerId;
    profile.profileId = persona.personaId;
    profile.profileName = persona.personaName;

	// Build the packet
	// Response Code
	// 0x607 = Game Persona Info
	const responsePacket = new LegacyMessage();
	responsePacket._header.id = 0x607;
	responsePacket.setBuffer(profile.serialize());
	log.verbose(
		`LegacyMsg response object from getPersonaInfo ${responsePacket
			._doSerialize()
			.toString("hex")} `,
	);

	const outboundMessage = new SerializedBufferOld();
	outboundMessage.setBuffer(responsePacket._doSerialize());

	return {
		connectionId,
		messages: [outboundMessage],
	};
}
