import { type BytableMessage, BytableBuffer } from "@rustymotors/binary";
import { getServerLogger, RawMessage, type ServerLogger } from "rusty-motors-shared";

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
    const response = new RawMessage()
    response.id = 0x217
    response.length = 4

    const responsePacket = new BytableBuffer()
    responsePacket.deserialize(response.serialize())

	return {
		connectionId,
		messages: [],
	};
}