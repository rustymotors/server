import {
	SerializedBufferOld,
	type ServiceResponse,
} from "rusty-motors-shared";
import { type BufferSerializer } from "rusty-motors-shared-packets";
import { ChatMessage } from "./ChatMessage.js";
import {
	handleListInGameEmailsMessage,
	handleReceiveEmailMessage,
} from "./inGameEmails.js";
import { bufferToHexString } from "./toHexString.js";
import * as Sentry from "@sentry/node";
import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("chat");

const handlers = new Map<number, (message: ChatMessage) => Buffer[]>();
handlers.set(0x0524, handleReceiveEmailMessage);
handlers.set(0x0526, handleListInGameEmailsMessage);


/**
 * Receive chat data
 *
 * @param connectionId - Connection ID
 * @param message - Message
 * @returns Service response
 */
async function receiveChatData({
	connectionId,
	message,
}: {
	connectionId: string;
	message: BufferSerializer;
}): Promise<ServiceResponse> {
	defaultLogger.info(`Received chat data from connection ${connectionId}`);
	defaultLogger.verbose(`Message: ${message.toHexString()}`);

	let inboundMessage: ChatMessage;
	
	try {
		inboundMessage = ChatMessage.fromBuffer(message.serialize());
	} catch (error) {
		const err = new Error(`[${connectionId}] Error deserializing message`, {
			cause: error,
		});
		defaultLogger.error(err.message);
		Sentry.captureException(err);
		return {
			connectionId,
			messages: [],
		};
	}
	defaultLogger.verbose(`Deserialized message: ${inboundMessage.toString()}`);

	const id = inboundMessage.messageId;

	defaultLogger.verbose(`Message ID: ${id}`);

	const handler = handlers.get(id);

	if (handler) {
		defaultLogger.verbose(`Handling message with ID ${id}`);
		const responses = handler(inboundMessage);
		defaultLogger.verbose(
			`Responses: ${responses.map((response) => bufferToHexString(response))}`,
		);
		const messages = responses.map((response) => {
			const responseBuffer = new SerializedBufferOld();
			responseBuffer.deserialize(response);
			return responseBuffer;
		});

		return {
			connectionId,
			messages,
		};
	}

	throw new Error(
		`Unable to process chat data from connection ${connectionId}, data: ${message.toHexString()}`,
	);
}

export { receiveChatData };
