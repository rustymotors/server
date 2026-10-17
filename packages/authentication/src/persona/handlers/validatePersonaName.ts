import type { ServerLogger, LegacyMessage } from "rusty-motors-shared";
import { getServerLogger } from "rusty-motors-shared";
import { BytableBuffer, BytableMessage } from "@rustymotors/binary";

const defaultLogger = getServerLogger("PersonaServer");

/**
 * Check if a new persona name is valid
 */

export async function validatePersonaName({
	connectionId,
	message,
	log = defaultLogger,
}: {
	connectionId: string;
	message: LegacyMessage;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	messages: BytableBuffer[];
}> {
	log.debug("validatePersonaName called");
	const requestPacket = message;
	log.debug(
		`NPSMsg request object from validatePersonaName ${requestPacket.toString()}`,
	);

	enum responseCodes {
		NPS_DUP_USER = 0x20a,
		NPS_USER_VALID = 0x601,
	}

	const responsePacket = new BytableMessage();
	responsePacket.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
	responsePacket.setVersion(0);
	responsePacket.header.setId(responseCodes.NPS_DUP_USER);

	log.debug(
		`NPSMsg response object from validatePersonaName
      ${JSON.stringify({
				NPSMsg: responsePacket.serialize().toString('hex'),
			})}`,
	);

	const outboundMessage = new BytableBuffer();
	outboundMessage.deserialize(responsePacket.serialize());

	return {
		connectionId,
		messages: [outboundMessage],
	};
}
