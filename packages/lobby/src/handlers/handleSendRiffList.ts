import { getServerLogger } from "rusty-motors-shared";
import type { ServerLogger } from "rusty-motors-shared";
import { BytableMessage, NpsRiffListMessage } from "@rustymotors/binary";

export async function handleSendRiffList({
    connectionId,
    message,
    log = getServerLogger('lobby.handleSendRiffList'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: BytableMessage[];
}> {
    log.debug(`[${connectionId}] Handling NPS_SEND_RIFF_LIST`);
    log.debug(
        `[${connectionId}] Received command: ${message.header.id}`,
    );

    const msg = new NpsRiffListMessage();
    msg.id = 0x0401; // NPS_RIFF_LIST

    return {
        connectionId,
        messages: [msg],
    };
}
