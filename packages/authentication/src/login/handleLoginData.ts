import {
	type ServerLogger,
} from "rusty-motors-shared";
import { getAuthHandlerRegistry } from "../internal.js";
import type { AuthHandlerResult } from "../handlers/registry.js";
import { getServerLogger } from "rusty-motors-shared";
import { BytableMessage } from "@rustymotors/binary";

/**
 * Handles the reception of login data, deserializes the incoming message, and processes it.
 *
 * @param {Object} params - The parameters for the function.
 * @param {string} params.connectionId - The ID of the connection.
 * @param {GamePacket} params.message - The serialized message buffer.
 * @param {ServerLogger} [params.log=defaultLogger] - Optional logger instance.
 * @returns {Promise<{
 *  connectionId: string,
 *  messages: GamePacket[],
 * }>} - The response from the login data handler.
 * @throws {Error} - Throws an error if there is an issue processing the login data.
 */
export async function handleLoginData({
	connectionId,
	message,
	log = getServerLogger("LoginServer"),
}: {
	connectionId: string;
	message: BytableMessage;
	log?: ServerLogger;
}): Promise<AuthHandlerResult> {
	const inboundMessage = new BytableMessage(1);
	inboundMessage.deserialize(message.serialize());

	// Use the handler registry to find the appropriate handler
	const registry = getAuthHandlerRegistry();
	const handlerEntry = registry.getHandler(inboundMessage.header.id);

	if (!handlerEntry) {
		// We do not yet support this message code
		throw Error(
			`[${connectionId}] UNSUPPORTED_MESSAGECODE: ${inboundMessage.header.id}`,
		);
	}

	try {
		const result = await handlerEntry.handler({
			connectionId,
			message,
		});
		log.debug(
			`[${connectionId}] Leaving handleLoginData with ${result.messages.length} messages`,
		);
		return result;
	} catch (error) {
		const err = Error(`[${connectionId}] Error in login service`, {
			cause: error,
		});
		throw err;
	}
}
