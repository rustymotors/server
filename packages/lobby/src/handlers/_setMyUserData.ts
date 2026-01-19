import {
    ServerLogger,
    getServerLogger,
    UserInfoMessage,
    diffObj,
    databaseProvider,
} from 'rusty-motors-shared';
import { BytableMessage } from '@rustymotors/binary';

export async function _setMyUserData({
    connectionId,
    message,
    log = getServerLogger('lobby._setMyUserData'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}) {
    try {
        log.debug(`Handling NPS_SET_MY_USER_DATA`, {
            connectionId,
        });
        log.debug(`Received command: ${message.header.id}`, {
            connectionId,
        });

        const incomingMessage = new UserInfoMessage();
        incomingMessage.deserialize(message.serialize());

        const userId = incomingMessage.userInfo.userId;

        log.debug(`User ID: ${userId}`, {
            connectionId,
            userId,
        });
        log.debug(
            `UserData: ${JSON.stringify(incomingMessage.userInfo.userData)}`,
            {
                connectionId,
            },
        );

        const sessionStore = databaseProvider.getSessionStore();
        const existingUserInfo = await sessionStore.getUser(userId)

        const { isDataDiff, diffs } = diffObj(
            existingUserInfo,
            incomingMessage.userInfo,
        );

        if (isDataDiff) {
            log.warn('Changes in UserInfo', {
                connectionId,
                userId,
                diffs,
            });
        }

        // Update the user's data
        await sessionStore.updateUser({
            userId: incomingMessage.userInfo.userId,
            userInfo: incomingMessage.userInfo,
        });

        const userInfo = await sessionStore.getUser(userId);

        if (typeof userInfo === 'undefined') {
            throw new Error(`Unable to locate user info for user ${userId}`);
        }

        // Build the packet
        const outboundMessage = new UserInfoMessage();
        outboundMessage.setUserInfo(userInfo);

        outboundMessage.setOpCode(0x204);

        log.debug('Sending UserInfo', {
            connectionId,
            data: message.serialize().toString('hex'),
        });

        return {
            connectionId,
            messages: [outboundMessage],
        };
    } catch (error) {
        const err = Error(
            `[${connectionId}] Error handling NPS_SET_MY_USER_DATA: ${String(error)}`,
        );
        err.cause = error;
        throw err;
    }
}
