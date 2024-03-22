import { ServerLogger, LegacyMessage } from "@rustymotors/shared";
/**
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {ServerLogger} args.log
 */
export declare function handleGetMiniUserList({
    connectionId,
    message,
    log,
}: {
    connectionId: string;
    message: LegacyMessage;
    log: ServerLogger;
}): Promise<{
    connectionId: string;
    message: LegacyMessage;
}>;
