import { BytableMessage } from '@rustymotors/binary';
import { ServerLogger } from '@rustymotors/logging';
import { GameServerListMessage, GameServerInfo } from 'rusty-motors-shared';

export function createGameServersListMessage(log: ServerLogger, connectionId: string) {
    const outgoingGameMessage = new GameServerListMessage();

    outgoingGameMessage.id = 0x402;

    const gameServer1 = new GameServerInfo('RACE', '71.186.155.248');

    outgoingGameMessage.add(gameServer1);

    log.debug(
        `Sending gameserver response[serialize]: ${JSON.stringify(gameServer1)}`,
        { connectionId }
    );

    // Build the packet
    const gameServerListMessage = new BytableMessage();
    gameServerListMessage.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
    gameServerListMessage.setVersion(0);
    gameServerListMessage.deserialize(outgoingGameMessage.serialize());

    log.debug(
        `Sending gameserver response[serialize2]: ${gameServerListMessage.serialize().toString('hex')}`,
        { connectionId }
    );
    return gameServerListMessage;
}
