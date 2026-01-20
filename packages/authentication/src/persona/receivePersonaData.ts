import {
	getServerLogger,
	type ServerLogger,
	LegacyMessage,
} from "rusty-motors-shared";
import type { BufferSerializer } from "rusty-motors-protocol";
import type { BytableBuffer } from "@rustymotors/binary";
import { getAuthHandlerRegistry } from "../internal.js";

/**
 * Receives and processes persona data messages.
 *
 * @param args.connectionId - The connection ID
 * @param args.message - The incoming message
 * @param args.log - Optional logger instance
 * @returns The connection ID and response messages
 * @throws {Error} If the message code is not supported
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
	messages: BytableBuffer[];
}> {
	// The packet needs to be an NPSMessage
	const inboundMessage = new LegacyMessage();
	inboundMessage._doDeserialize(message.serialize());

	// Use the handler registry to find the appropriate handler
	const registry = getAuthHandlerRegistry();
	const handlerEntry = registry.getHandler(inboundMessage._header.id);

	if (!handlerEntry) {
		// We do not yet support this message code
		throw Error(
			`[${connectionId}] UNSUPPORTED_MESSAGECODE: ${inboundMessage._header.id}`,
		);
	}

	try {
		const result = await handlerEntry.handler({
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
