import { ServerLogger, SerializedBuffer } from "@rustymotors/shared";
export declare function handleTrackingPing({
    connectionId,
    message,
    log,
}: {
    connectionId: string;
    message: SerializedBuffer;
    log: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: SerializedBuffer[];
}>;
