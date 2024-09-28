import type { ServerPacket } from "rusty-motors-shared-packets";
import { processClientConnect } from "./processClientConnect.js";
import { processClientTracking } from "./processClientTracking.js";
import { processServerLogin } from "./processServerLogin.js";
import { processSetOptions } from "./processSetOptions.js";
import { processStockCarInfo } from "./processStockCarInfo.js";

export type ServerSocketCallback = (messages: ServerPacket[]) => void;

export type ServerMessageProcessor = (
	connectionId: string,
	message: ServerPacket,
	socketCallback: ServerSocketCallback,
) => Promise<void>;

const serverMessageProcessors = new Map<number, ServerMessageProcessor>([]);

export function addServerMessageProcessor(
	messageId: number,
	processor: ServerMessageProcessor,
) {
	serverMessageProcessors.set(messageId, processor);
}

/**
 * Populates the server message processors.
 *
 * This function adds various server message processors to handle different types of messages.
 * Each server message processor is associated with a specific message ID and a corresponding processing function.
 *
 * @remarks
 * The server message processors are used to process incoming messages from the server and perform the necessary actions based on the message type.
 *
 * @example
 * // Add server message processors
 * populateServerMessageProcessors();
 */
export function populateServerMessageProcessors() {
	addServerMessageProcessor(105, processServerLogin);
	addServerMessageProcessor(109, processSetOptions);
	addServerMessageProcessor(141, processStockCarInfo);
	addServerMessageProcessor(440, processClientTracking);
	addServerMessageProcessor(438, processClientConnect);
}

/**
 * Retrieves the server message processor for the given message ID.
 *
 * @param messageId - The ID of the message.
 * @returns The server message processor associated with the given message ID, or `undefined` if no processor is found.
 */
export function getServerMessageProcessor(
	messageId: number,
): ServerMessageProcessor | undefined {
	return serverMessageProcessors.get(messageId);
}

export function getServerMessageProcessors() {
	return serverMessageProcessors;
}
