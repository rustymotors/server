import { BytableMessage } from "@rustymotors/binary";
import { getServerLogger, ServerLogger } from "rusty-motors-shared";


export async function defaultMessageHandler({
	connectionId, message, log = getServerLogger("MCOProtocol/defaultMessageHandler"),
}: {
	connectionId: string;
	message: BytableMessage;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	message: BytableMessage | null;
}> {
	const messageId = message.header.messageId;
	log.verbose(
		"Not yet implemented",
		{ connectionId, messageId: messageId.toString(16) },
	);
	return { connectionId, message: null };
}