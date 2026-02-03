import { type ServerLogger, LegacyMessage } from "rusty-motors-shared";
import { getServerLogger } from "rusty-motors-shared";
import { BytableBuffer } from "@rustymotors/binary";

const defaultLogger = getServerLogger("PersonaServer");

/**
 * Selects a game persona and marks it as in use
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {ServerLogger} [args.log=getServerLogger({ name: "LoginServer" })]
 * @returns {Promise<{
 *  connectionId: string,
 * messages: BytableBuffer[],
 * }>}
 */

export async function _selectGamePersona({
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
	log.debug("_npsSelectGamePersona...");
	const requestPacket = message;
	log.debug(
		`LegacyMsg request object from _npsSelectGamePersona ${requestPacket
			._doSerialize()
			.toString("hex")}`,
	);

	// Create the packet content
	const packetContent = Buffer.alloc(251);

	// Build the packet
	// Response Code
	// 207 = success
	const responsePacket = new LegacyMessage();
	responsePacket._header.id = 519;
	responsePacket.setBuffer(packetContent);
	log.debug(
		`LegacyMsg response object from _npsSelectGamePersona ${responsePacket
			._doSerialize()
			.toString("hex")} `,
	);

	const outboundMessage = new BytableBuffer();
	outboundMessage.setValue(responsePacket._doSerialize());

	return {
		connectionId,
		messages: [outboundMessage],
	};
}
