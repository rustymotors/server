import { getServerConfiguration } from "../../../shared/Configuration.js";
import { getServerLogger } from "../../../shared/log.js";
import { SerializedBuffer } from "../../../shared/SerializedBuffer.js";

export async function handleTrackingPing({
    connectionId,
    message,
    log = getServerLogger({
        module: "Lobby",
    }),
}: {
    connectionId: string;
    message: SerializedBuffer;
    log?: import("pino").Logger;
}): Promise<{
    connectionId: string;
    messages: SerializedBuffer[];
}> {
    log.level = getServerConfiguration({}).logLevel ?? "info";

    log.debug("Handling NPS_TRACKING_PING");
    log.debug(`Received command: ${message.toString()}`);

    log.debug("Skipping response");

    return {
        connectionId,
        messages: [],
    };
}
