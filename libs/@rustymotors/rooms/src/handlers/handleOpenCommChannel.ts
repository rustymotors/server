import { BytableMessage } from '@rustymotors/binary';
import {
    databaseProvider,
    getServerLogger,
    NPS_MESSAGE_IDS,
    RawMessage,
    UserJoinedChannelMessage,
    type ServerLogger,
} from 'rusty-motors-shared';
import { getPrimaryRoomServer } from '../index.js';
import { User } from '../lib/User.js';

function createChannelGrantedPacket(commId: number, port: number): BytableMessage {
    const outgoing = new BytableMessage();
    outgoing.setSerializeOrder([
        { name: 'commId', field: 'Dword' },
        { name: 'port', field: 'Dword' },
    ]);
    outgoing.header.setId(NPS_MESSAGE_IDS.CHANNEL_GRANTED);
    outgoing.setVersion(0);
    outgoing.setFieldValueByName('commId', commId);
    outgoing.setFieldValueByName('port', port);

    const packet = new BytableMessage();
    packet.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
    packet.setVersion(0);
    packet.deserialize(outgoing.serialize());
    return packet;
}

function parseOpenCommChannelMessage(buffer: Buffer): BytableMessage {
    const msg = new BytableMessage();
    msg.setSerializeOrder([
        { name: 'commId', field: 'Dword' },
        { name: 'riffName', field: 'PString' },
        { name: 'slotNumber', field: 'Dword' },
        { name: 'slotFlags', field: 'Dword' },
        { name: 'portNumber', field: 'Dword' },
        { name: 'protocol', field: 'Dword' },
        { name: 'userId', field: 'Dword' },
        { name: 'connectedUsers', field: 'Short' },
        { name: 'openChannels', field: 'Short' },
        { name: 'canReady', field: 'Short' },
        { name: 'gameReady', field: 'Short' },
        { name: 'isMaster', field: 'Short' },
        { name: 'channelType', field: 'Short' },
        { name: 'password', field: 'PString' },
        { name: 'disableBacklog', field: 'Short' },
        { name: 'gameServerIsRunning', field: 'Boolean' },
        { name: 'launchGameServer', field: 'Short' },
        { name: 'maxReadyPlayers', field: 'Short' },
        { name: 'sku', field: 'Dword' },
        { name: 'sendRate', field: 'Dword' },
        { name: 'channelData', field: 'ChannelData' },
        { name: 'flags', field: 'Dword' },
    ]);
    msg.deserialize(buffer);
    return msg;
}

export async function handleOpenCommChannel({
    connectionId,
    message,
    log = getServerLogger('rooms.handleOpenCommChannel'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: BytableMessage[] }> {
    const request = parseOpenCommChannelMessage(message.serialize());

    const commIdBuf = request.getFieldValueByName('commId') as Buffer;
    const commId = commIdBuf.readInt32BE();
    const userIdBuf = request.getFieldValueByName('userId') as Buffer;
    const userId = userIdBuf.readInt32BE();

    log.debug(`[${connectionId}] NPS_OPEN_COMM_CHANNEL commId=${commId} userId=${userId}`);

    const connectionPort = Number.parseInt(connectionId.split(':')[1] ?? '7003');
    const server = getPrimaryRoomServer();
    const room = server.getRoomByCommId(commId);

    if (room) {
        // Add or refresh user in room
        let user = room.userList.get(userId);
        if (!user) {
            user = new User(userId, userId);
            const sessionStore = databaseProvider.getSessionStore();
            const userInfo = await sessionStore.getUser(userId);
            if (userInfo) {
                user.setFromUserInfo(userInfo);
            }
            room.addUser(userId, user);
        }
        user.isInLobby = commId === 0;
        user.lobbyId = commId === 0 ? 0 : commId;
    }

    const responses: BytableMessage[] = [];

    // Broadcast UserJoinedChannel to the connection
    if (room) {
        const user = room.userList.get(userId);
        if (user?.userData) {
            const joined = new UserJoinedChannelMessage(
                user.userName,
                user.userId,
                commId,
                user.userData,
                user.personaId,
            );
            const raw = new RawMessage();
            raw.id = NPS_MESSAGE_IDS.USER_JOINED_CHANNEL;
            raw.data = joined.serialize();
            const joinedPacket = BytableMessage.FromRawMessage(raw);
            responses.push(joinedPacket);
        }
    }

    responses.push(createChannelGrantedPacket(commId, connectionPort));

    return { connectionId, messages: responses };
}
