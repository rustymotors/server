import { getServerConfiguration } from "rusty-motors-shared";
import { getServerLogger } from "rusty-motors-shared";
import { SerializedBufferOld } from "rusty-motors-shared";

export async function handleTrackingPing({
    connectionId,
    message,
    log = getServerLogger({
        module: "Lobby",
    }),
}: {
    connectionId: string;
    message: SerializedBufferOld;
    log?: import("pino").Logger;
}): Promise<{
    connectionId: string;
    messages: SerializedBufferOld[];
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
