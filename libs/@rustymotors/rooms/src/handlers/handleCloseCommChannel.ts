import { BytableMessage } from '@rustymotors/binary';
import { getServerLogger, type ServerLogger } from 'rusty-motors-shared';
import { getPrimaryRoomServer } from '../index.js';

export async function handleCloseCommChannel({
    connectionId,
    message,
    log = getServerLogger('rooms.handleCloseCommChannel'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: BytableMessage[] }> {
    const request = new BytableMessage();
    request.setSerializeOrder([{ name: 'commId', field: 'Dword' }]);
    request.deserialize(message.serialize());

    const commId = (request.getFieldValueByName('commId') as Buffer).readInt32BE();
    log.debug(`[${connectionId}] NPS_CLOSE_COMM_CHANNEL commId=${commId}`);

    // No userId in the close message — remove by connection mapping if available
    const server = getPrimaryRoomServer();
    const room = server.getRoomByCommId(commId);
    if (!room) {
        log.warn(`[${connectionId}] NPS_CLOSE_COMM_CHANNEL unknown commId=${commId}`);
    }

    const outgoing = new BytableMessage();
    outgoing.setSerializeOrder([
        { name: 'commId', field: 'Dword' },
        { name: 'port', field: 'Dword' },
    ]);
    outgoing.header.setId(0x209);
    outgoing.setVersion(0);
    outgoing.setFieldValueByName('commId', commId);
    outgoing.setFieldValueByName('port', 7003);

    const packet = new BytableMessage();
    packet.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
    packet.setVersion(0);
    packet.deserialize(outgoing.serialize());

    return { connectionId, messages: [packet] };
}
