import { BytableMessage } from '@rustymotors/binary';
import {
    databaseProvider,
    GameServerLaunchInfo,
    getServerLogger,
    NPS_MESSAGE_IDS,
    RawMessage,
    RunningServerInfo,
    type ServerLogger,
    UserJoinedChannelMessage,
} from 'rusty-motors-shared';
import { getPrimaryRoomServer } from '../index.js';

export async function handleStartGameServer({
    connectionId,
    message,
    log = getServerLogger('rooms.handleStartGameServer'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: BytableMessage[] }> {
    log.debug(`[${connectionId}] NPS_START_GAME_SERVER`);

    const startServerLaunchInfo = new GameServerLaunchInfo();
    startServerLaunchInfo.deserialize(message.getBody());
    const { commId, bestHost } = startServerLaunchInfo;

    const sessionStore = databaseProvider.getSessionStore();
    const userId = await sessionStore.findUserByConnectionId(connectionId);
    if (!userId) {
        throw new Error(`[${connectionId}] NPS_START_GAME_SERVER: no user for connection`);
    }

    log.verbose(`[${connectionId}] game server launch commId=${commId} host=${bestHost} userId=${userId}`);

    const newServerInfo = new RunningServerInfo();
    newServerInfo.riff = 'RACE';
    newServerInfo.commId = commId;
    newServerInfo.ipAddress = bestHost;
    newServerInfo.port = 9000;
    newServerInfo.userId = userId;
    newServerInfo.numberOfPlayers = 1;

    sessionStore.updateGameServer(commId, newServerInfo);

    // Look up personaId from room user list
    const server = getPrimaryRoomServer();
    const room = server.getRoomByCommId(commId);
    const roomUser = room?.userList.get(userId);
    const personaId = roomUser?.personaId ?? userId;

    const userInfo = await sessionStore.getUser(userId);
    const responses: BytableMessage[] = [];

    if (userInfo) {
        const joined = new UserJoinedChannelMessage(
            userInfo.userName,
            userInfo.userId,
            commId,
            userInfo.userData,
            personaId,
        );
        const joinRaw = new RawMessage();
        joinRaw.id = NPS_MESSAGE_IDS.USER_JOINED_CHANNEL;
        joinRaw.data = joined.serialize();
        responses.push(BytableMessage.FromRawMessage(joinRaw));
    }

    const startedBuf = Buffer.alloc(4);
    startedBuf.writeInt32BE(commId);
    const startedRaw = new RawMessage();
    startedRaw.id = 0x21c; // NPS_GAME_SERVER_STARTED
    startedRaw.data = startedBuf;
    responses.push(BytableMessage.FromRawMessage(startedRaw));

    return { connectionId, messages: responses };
}
