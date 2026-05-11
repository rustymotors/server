import { BytableMessage } from '@rustymotors/binary';
import { getServerLogger, type ServerLogger } from 'rusty-motors-shared';
import { getPrimaryRoomServer } from '../index.js';

export async function handleSetChannelData({
    connectionId,
    message,
    log = getServerLogger('rooms.handleSetChannelData'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: BytableMessage[] }> {
    const body = message.data;

    if (body.length < 260) {
        log.warn(`[${connectionId}] NPS_SET_CHANNEL_DATA body too short: ${body.length}`);
        return { connectionId, messages: [] };
    }

    const commId = body.readInt32BE(0);
    const blob = body.subarray(4, 260);

    const server = getPrimaryRoomServer();
    const room = server.getRoomByCommId(commId);
    if (room) {
        room.channelData.deserialize(blob);
        log.debug(`[${connectionId}] NPS_SET_CHANNEL_DATA commId=${commId} stored`);
    } else {
        log.warn(`[${connectionId}] NPS_SET_CHANNEL_DATA unknown commId=${commId}`);
    }

    return { connectionId, messages: [] };
}
