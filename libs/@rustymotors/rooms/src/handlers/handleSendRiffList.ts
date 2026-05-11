import { BytableMessage, NpsRiffInfo, NpsRiffListMessage } from '@rustymotors/binary';
import { getServerLogger, type ServerLogger } from 'rusty-motors-shared';
import { getPrimaryRoomServer } from '../index.js';

export async function handleSendRiffList({
    connectionId,
    log = getServerLogger('rooms.handleSendRiffList'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: BytableMessage[] }> {
    log.debug(`[${connectionId}] NPS_SEND_RIFF_LIST`);

    const server = getPrimaryRoomServer();
    const msg = new NpsRiffListMessage();
    msg.id = 0x0401;

    for (const room of server.rooms) {
        const riff = new NpsRiffInfo();
        riff.riffName = room.riff;
        riff.commId = room.commId;
        riff.protocol = room.protocol;
        riff.channelType = room.channelType;
        riff.connectedUsers = room.userList.size;
        riff.maxReadyPlayers = room.maxReadyPlayers;
        riff.channelData = room.channelData.serialize();
        msg.addRiff(riff);
    }

    return { connectionId, messages: [msg] };
}
