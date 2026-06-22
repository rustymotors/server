import { type BytableMessage, BytableBuffer } from "@rustymotors/binary";
import { getServerLogger, type ServerLogger } from "rusty-motors-shared";

export async function handleTrackingPing({
	connectionId,
    log = getServerLogger("handleTrackingPing")
}: {
	connectionId: string;
	message: BytableMessage;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	messages: BytableBuffer[];
}> {
    log.debug("npsTrackingPing", {
        connectionId
    })

	return {
		connectionId,
		messages: [],
	};
}