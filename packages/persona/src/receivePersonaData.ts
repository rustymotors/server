import {
	getServerLogger,
	ServerLogger,
	SerializedBufferOld,
	LegacyMessage,
} from "rusty-motors-shared";
import type { BufferSerializer } from "rusty-motors-protocol";
import { messageHandlers } from "./internal.js";

/**
 *
 *
 * @param {object} args
 * @param {string} args.connectionId
 * @param {SerializedBufferOld} args.message
 * @param {ServerLogger} [args.log=getServerLogger({ name: "PersonaServer" })]
 * @returns {Promise<{
 *  connectionId: string,
 * messages: SerializedBufferOld[],
 * }>}
 * @throws {Error} Unknown code was received
 */

export async function receivePersonaData({
	connectionId,
	message,
	log = getServerLogger("PersonaServer/receivePersonaData"),
}: {
	connectionId: string;
	message: BufferSerializer;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	messages: SerializedBufferOld[];
}> {
	// The packet needs to be an NPSMessage
	const inboundMessage = new LegacyMessage();
	inboundMessage._doDeserialize(message.serialize());

	const supportedHandler = messageHandlers.find((h) => {
		return h.opCode === inboundMessage._header.id;
	});

	if (typeof supportedHandler === "undefined") {
		// We do not yet support this message code
		throw Error(
			`[${connectionId}] UNSUPPORTED_MESSAGECODE: ${inboundMessage._header.id}`,
		);
	}

	try {
		const result = await supportedHandler.handler({
			connectionId,
			message: inboundMessage,
			log,
		});
		log.debug(
			`[${connectionId}] Returning with ${result.messages.length} messages`,
		);
		return result;
	} catch (error) {
		const err = Error(`[${connectionId}] Error handling persona data`, {
			cause: error,
		});
		throw err;
	}
}
