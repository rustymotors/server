import type { BytableMessage } from '@rustymotors/binary';
import {
    databaseProvider,
    diffObj,
    getServerLogger,
    type ServerLogger,
    UserInfoMessage,
} from 'rusty-motors-shared';

export async function handleSetMyUserData({
    connectionId,
    message,
    log = getServerLogger('rooms.handleSetMyUserData'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: UserInfoMessage[] }> {
    log.debug(`[${connectionId}] NPS_SET_MY_USER_DATA`);

    const incomingMessage = new UserInfoMessage();
    incomingMessage.deserialize(message.serialize());

    const userId = incomingMessage.userInfo.userId;
    const sessionStore = databaseProvider.getSessionStore();
    const existingUserInfo = await sessionStore.getUser(userId);

    const { isDataDiff, diffs } = diffObj(existingUserInfo, incomingMessage.userInfo);
    if (isDataDiff) {
        log.warn(`[${connectionId}] UserInfo changes for userId=${userId}`, { diffs });
    }

    await sessionStore.updateUser({ userId, userInfo: incomingMessage.userInfo });
    await sessionStore.updateConnection(connectionId, userId);

    const userInfo = await sessionStore.getUser(userId);
    if (typeof userInfo === 'undefined') {
        throw new Error(`[${connectionId}] NPS_SET_MY_USER_DATA: no user info for userId=${userId}`);
    }

    const outbound = new UserInfoMessage();
    outbound.setUserInfo(userInfo);
    outbound.setOpCode(0x204);

    return { connectionId, messages: [outbound] };
}
