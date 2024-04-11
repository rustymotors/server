import { type TServerLogger, SerializedBuffer } from "../../../shared";

export async function handleTrackingPing({
    connectionId,
    message,
    log,
}: {
    connectionId: string;
    message: SerializedBuffer;
    log: TServerLogger;
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
