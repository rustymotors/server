import { BytableMessage } from "@rustymotors/binary";
import { RawMessage, type ServerLogger } from "rusty-motors-shared";

export async function handleSetChannelFlags({
    connectionId,
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: BytableMessage[];
}> {
    const response = new RawMessage()
    response.id = 0x217
    response.length = 4

    const responsePacket = new BytableMessage()
    responsePacket.deserialize(response.serialize())

    return {
        connectionId,
        messages: [],
    };
}