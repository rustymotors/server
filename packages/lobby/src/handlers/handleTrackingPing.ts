import { getServerConfiguration } from "../../../shared/Configuration.js";
import { ServerLogger, getServerLogger } from "../../../shared/log.js";
import { SerializedBuffer } from "../../../shared/messageFactory.js";

export async function handleTrackingPing({
    connectionId,
    message,
    log = getServerLogger({
        module: "Lobby",
    }),
}: {
    connectionId: string;
    message: SerializedBuffer;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: SerializedBuffer[];
}> {
    log.debug("Handling NPS_TRACKING_PING");
    log.debug(`Received command: ${message.toString()}`);

    log.debug("Skipping response");

    return {
        connectionId,
        messages: [],
    };
}
