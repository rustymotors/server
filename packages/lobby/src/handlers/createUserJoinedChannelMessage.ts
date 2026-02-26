import { BytableMessage } from '@rustymotors/binary';
import { type ServerLogger, databaseProvider, UserJoinedChannelMessage, NPS_MESSAGE_IDS } from 'rusty-motors-shared';
import { UserStatusManager } from 'rusty-motors-nps';
import { createRawMessage } from './handleOpenCommChannel.js';

export async function createUserJoinedChannelMessage(userId: number, requestedCommIdBuffer: string | number | Buffer<ArrayBufferLike>, log: ServerLogger, connectionId: string) {
    const sessionStore = databaseProvider.getSessionStore();
    const user = await sessionStore.getUser(userId);
    if (typeof user === 'undefined') {
        throw new Error(
            `Unable to locate user data for user ${userId}`
        );
    }
    // Get user status to retrieve personaId
    const userStatus = UserStatusManager.getUserStatus(userId);
    const personaId = userStatus?.getPersonaId();
    const userJoined = new UserJoinedChannelMessage(
        user.userName,
        user.userId,
        (requestedCommIdBuffer as Buffer).readInt32BE(),
        user.userData,
        personaId
    );

    const userJoinedMessage = BytableMessage.FromRawMessage(
        createRawMessage(NPS_MESSAGE_IDS.USER_JOINED_CHANNEL, userJoined)
    );

    log.debug('Outbound user join message', {
        connectionId,
        userId,
        json: JSON.stringify(userJoinedMessage),
        data: userJoinedMessage.serialize().toString('hex'),
    });
    return userJoinedMessage;
}
