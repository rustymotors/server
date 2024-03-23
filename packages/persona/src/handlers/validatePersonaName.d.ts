import { ServerLogger, LegacyMessage, SerializedBuffer } from "../../shared";
/**
 * Check if a new persona name is valid
 */
export declare function validatePersonaName({
    connectionId,
    message,
    log,
}: {
    connectionId: string;
    message: LegacyMessage;
    log: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: SerializedBuffer[];
}>;
