import { BytableMessage } from "@rustymotors/binary";
import { RawMessage, SerializedBufferOld, ServerLogger } from "rusty-motors-shared";

export async function handleTrackingPing({
	connectionId,
}: {
	connectionId: string;
	message: BytableMessage;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	messages: SerializedBufferOld[];
}> {
    const response = new RawMessage()
    response.id = 0x217
    response.length = 4

    const responsePacket = new SerializedBufferOld()
    responsePacket.deserialize(response.serialize())

	return {
		connectionId,
		messages: [],
	};
}