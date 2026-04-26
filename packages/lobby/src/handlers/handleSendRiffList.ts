import { getServerLogger } from "rusty-motors-shared";
import type { ServerLogger } from "rusty-motors-shared";
import { BytableMessage, NpsRiffInfo, NpsRiffListMessage } from "@rustymotors/binary";

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
    log.debug('[${connectionId}] Handling NPS_SEND_RIFF_LIST');
    log.debug(
        `[${connectionId}] Received command: ${message.header.id}`,
    );

    const riff = new NpsRiffInfo();
    riff.riffName = "race";
    riff.protocol = 33;
    riff.commId = 2883705;
    riff.password = "";
    riff.channelType = 2;
    riff.connectedUsers = 5;
    riff.openChannels = 10;
    riff.userIsConnected = false;
    riff.channelData = Buffer.alloc(256, 0x00);
    riff.numReadyPlayers = 3;
    riff.maxReadyPlayers = 8;
    riff.channelOwnerId = 21;
    riff.gameServerIsRunning = 4;

    const msg = new NpsRiffListMessage();
    msg.id = 0x0401; // NPS_RIFF_LIST
    msg.addRiff(riff);

    return {
        connectionId,
        messages: [msg],
    };
}
