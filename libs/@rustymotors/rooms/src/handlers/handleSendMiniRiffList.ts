import { BytableMessage } from '@rustymotors/binary';
import { LegacyMessage } from 'rusty-motors-shared';
import { getServerLogger, serializeString, type ServerLogger } from 'rusty-motors-shared';
import { getPrimaryRoomServer } from '../index.js';

const CHANNEL_RECORD_SIZE = 40;

export async function handleSendMiniRiffList({
    connectionId,
    log = getServerLogger('rooms.handleSendMiniRiffList'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: BytableMessage[] }> {
    log.debug(`[${connectionId}] NPS_SEND_MINI_RIFF_LIST`);

    const server = getPrimaryRoomServer();
    const allChannels = server.rooms;

    const packetContent = Buffer.alloc(CHANNEL_RECORD_SIZE * allChannels.length + 4);
    let offset = 0;

    packetContent.writeUInt32BE(allChannels.length, offset);
    offset += 4;

    for (const room of allChannels) {
        offset = serializeString(room.riff, packetContent, offset);
        packetContent.writeUInt32BE(room.commId, offset);
        offset += 4;
        packetContent.writeUInt16BE(room.userList.size, offset);
        offset += 2;
    }

    const outgoing = new LegacyMessage();
    outgoing.setMessageId(1028);
    outgoing.setBuffer(packetContent.subarray(0, offset));

    const packetResult = new BytableMessage();
    packetResult.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
    packetResult.deserialize(outgoing.serialize());

    return { connectionId, messages: [packetResult] };
}
