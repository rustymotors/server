import { ServerLogger, LegacyMessage } from "@rustymotors/shared";
export declare function _setMyUserData({
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
