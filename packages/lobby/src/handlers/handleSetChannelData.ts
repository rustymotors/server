import { BytableMessage } from '@rustymotors/binary';
import { getServerLogger, type ServerLogger } from 'rusty-motors-shared';

// Client calls this every idle tick via Pit_UpdateRoom(): it memcmp's local
// race settings against the stored channelData blob and only sends 0x113 when
// they differ. Treat it as idempotent — no ACK required, but when rooms are
// wired up this is where we store the new blob and broadcast NPS_CHANNEL_UPDATE
// (0x219) to other connections in the same room.
export async function handleSetChannelData({
    connectionId,
    message,
    log = getServerLogger('lobby.handleSetChannelData'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: BytableMessage[];
}> {
    const body = message.data;

    if (body.length < 260) {
        log.warn(`[${connectionId}] NPS_SET_CHANNEL_DATA body too short: ${body.length} bytes`);
        return { connectionId, messages: [] };
    }

    const commId = body.readInt32BE(0);
    const channelData = body.subarray(4, 260);

    log.debug(`[${connectionId}] NPS_SET_CHANNEL_DATA commId=${commId} data=${channelData.toString('hex').slice(0, 32)}...`);

    return { connectionId, messages: [] };
}
