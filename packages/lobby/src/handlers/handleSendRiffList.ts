import { RiffInfo, RiffInfoListMessage, type ServerLogger, } from "rusty-motors-shared";
import { getServerLogger } from "rusty-motors-shared";
import { BytableMessage } from "@rustymotors/binary";

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

    const outgoingGameMessage = new RiffInfoListMessage();
    outgoingGameMessage.id = 0x401; // NPS_RIFF_LIST

    const newRiff = new RiffInfo();
    newRiff.riffName = "race";
    newRiff.protocol = 33;
    newRiff.commId = 2883705;
    newRiff.password = "";
    newRiff.channelType = 2;
    newRiff.connectedUsersCount = 5;
    newRiff.openChannelsCount = 10;
    newRiff.isUserConnected = true;
    newRiff.channelData = Buffer.alloc(256, 0x00);
    newRiff.numReadyPlayers = 3;
    newRiff.maxReadyPlayers = 8;
    newRiff.channelOwnerId = 21;
    newRiff.gameServerIsRunning = true;

    outgoingGameMessage.addRiff(newRiff);
    
    // Build the packet
    const packetResult = new BytableMessage();
    packetResult.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
    packetResult.deserialize(outgoingGameMessage.serialize());


    try {
        return {
            connectionId,
            messages: [packetResult],
        };
    } catch (error) {
        const err = Error(
            `Error handling NPS_SEND_RIFF_LIST: ${String(error)}`,
        );
        err.cause = error;
        throw err;
    }
}