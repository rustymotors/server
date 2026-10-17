import { BytableMessage } from '@rustymotors/binary';
import {
    getServerLogger,
    type ServerLogger,
    ReadyForGame,
    ReadyForGameList,
} from 'rusty-motors-shared';

export async function handleGetReadyList({
    connectionId,
    message,
    log = getServerLogger('lobby.handleGetReadyList'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: BytableMessage[];
}> {
    log.debug('[${connectionId}] Handling NPS_GET_READY_LIST');
    log.debug(
        `[${connectionId}] Received command: ${message.header.id}`,
    );

    // l
    const requestedCommId = message.data.readInt32BE()

    log.debug(`Requested player ready list for commId: ${requestedCommId.toString(16)}`, {
        connectionId,
        requestedCommId,
    });

    const player1 = new ReadyForGame(requestedCommId, 21, true, true);

    const readyList = new ReadyForGameList(player1.sizeOf);
    readyList.add(player1);

    const body = readyList.serialize();

    const responsePacket = new BytableMessage();
    responsePacket.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
    responsePacket.setVersion(0);
    responsePacket.header.setId(0x210);
    responsePacket.setFieldValueByName('data', body);

    return {
        connectionId,
        messages: [responsePacket],
    };
}
