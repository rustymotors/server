import { BytableMessage } from '@rustymotors/binary';
import {
    getServerLogger,
    RawMessage,
    ReadyForGame,
    ReadyForGameList,
    type ServerLogger,
} from 'rusty-motors-shared';
import { getPrimaryRoomServer } from '../index.js';

export async function handleGetReadyList({
    connectionId,
    message,
    log = getServerLogger('rooms.handleGetReadyList'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: BytableMessage[] }> {
    const commId = message.data.readInt32BE(0);
    log.debug(`[${connectionId}] NPS_GET_READY_LIST commId=${commId}`);

    const server = getPrimaryRoomServer();
    const room = server.getRoomByCommId(commId);

    const readyList = new ReadyForGameList(12);

    if (room) {
        for (const user of room.userList.values()) {
            readyList.add(new ReadyForGame(commId, user.userId, true, true));
        }
    }

    const body = readyList.serialize();
    const response = new RawMessage();
    response.id = 0x210;
    response.length = 4 + body.length;
    response.data = body;

    const packet = new BytableMessage();
    packet.deserialize(response.serialize());

    return { connectionId, messages: [packet] };
}
