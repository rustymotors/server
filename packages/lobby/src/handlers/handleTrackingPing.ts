import { type ServerLogger } from "rusty-motors-shared";
import { getServerLogger } from "rusty-motors-shared";
import { SerializedBufferOld } from "rusty-motors-shared";

export async function handleTrackingPing({
	connectionId,
	message,
	log = getServerLogger({
		name: "Lobby",
	}),
}: {
	connectionId: string;
	message: SerializedBufferOld;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	messages: SerializedBufferOld[];
}> {
	log.debug("Handling NPS_TRACKING_PING");
	log.debug(`Received command: ${message.toString()}`);

	log.debug("Skipping response");

	return {
		connectionId,
		messages: [],
	};
}
