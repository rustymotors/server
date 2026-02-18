import { BytableMessage } from '@rustymotors/binary';
import {
    getServerLogger,
    NPS_MESSAGE_IDS,
    RawMessage,
    type Serializable,
    type ServerLogger,
    UserJoinedChannelMessage,
    databaseProvider,
} from 'rusty-motors-shared';
import {UserStatusManager} from "rusty-motors-nps";

export async function handleOpenCommChannel({
    connectionId,
    message,
    log = getServerLogger('lobby.handleOpenCommChannel'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: BytableMessage[];
}> {
    try {
        log.debug(`[${connectionId}] Handling NPS_OPEN_COMM_CHANNEL`);
        log.debug(
            `[${connectionId}] Received command: ${message.header.id}`,
        );

        // l
        const incomingRequest = new BytableMessage();
        incomingRequest.setSerializeOrder([
            { name: 'commId', field: 'Dword' },
            { name: 'riffName', field: 'String' },
            { name: 'slotNumber', field: 'Dword' },
            { name: 'slotFlags', field: 'Dword' },
        ]);
        incomingRequest.deserialize(message.serialize());

        const requestedCommIdBuffer =
            incomingRequest.getFieldValueByName('commId') ?? -1;
        const requestedRiffName =
            incomingRequest.getFieldValueByName('riffName') ?? '';
        const requestedCommId = (requestedCommIdBuffer as Buffer).readInt32BE();

        log.debug(
            `[${connectionId}] Requested we open a channel on ${requestedRiffName}(${requestedCommId})`,
        );

        // TODO: Actually have servers
        const port = Number.parseInt(connectionId.split(':')[1] ?? '7003');

        const responsePackets = [];

        const packetResult = createNPSChannelGrantedPacket(
            (requestedCommIdBuffer as Buffer).readInt32BE(),
            port,
        );
        log.debug(
            `[${connectionId}]  Sending comm GRANTED: ${JSON.stringify(packetResult)}`,
        );

        responsePackets.push(packetResult);

        if (requestedCommId > 100) {
            // Create user joined channel message
            const sessionStore = databaseProvider.getSessionStore();
            const userId =
                await sessionStore.findUserByConnectionId(connectionId);
            if (typeof userId === 'undefined') {
                throw new Error(
                    `Unable to locate user for connection ${connectionId}`,
                );
            }
            const user = await sessionStore.getUser(userId);
            if (typeof user === 'undefined') {
                throw new Error(
                    `Unable to locate user data for user ${userId}`,
                );
            }
            // Get user status to retrieve personaId
            const userStatus = UserStatusManager.getUserStatus(userId);
            const personaId = userStatus?.personaId ?? 0;
            const userJoined = new UserJoinedChannelMessage(
                user.userName,
                user.userId,
                (requestedCommIdBuffer as Buffer).readInt32BE(),
                user.userData,
                personaId,
            );

            const userJoinedMessage = BytableMessage.FromRawMessage(
                createRawMessage(NPS_MESSAGE_IDS.USER_JOINED_CHANNEL, userJoined),
            );

            log.debug('Outbound user join message', {
                connectionId,
                userId,
                json: JSON.stringify(userJoinedMessage),
                data: userJoinedMessage.serialize().toString('hex'),
            });

            responsePackets.push(userJoinedMessage);
        }
        return {
            connectionId,
            messages: responsePackets,
        };
    } catch (error) {
        const err = Error(
            `[${connectionId}] Error handling NPS_OPEN_COMM_CHANNEL: ${String(error)}`,
        );
        err.cause = error;
        throw err;
    }
}

export function createRawMessage(msgCode: number, body: Serializable) {
    const message = new RawMessage();
    message.id = msgCode;
    message.data = body.serialize();
    return message;
}

export function createNPSChannelGrantedPacket(
    commId: number,
    commPort: number,
) {
    // ll
    const outgoingGameMessage = new BytableMessage();
    outgoingGameMessage.setSerializeOrder([
        { name: 'commId', field: 'Dword' },
        { name: 'port', field: 'Dword' },
    ]);

    outgoingGameMessage.header.setId(NPS_MESSAGE_IDS.CHANNEL_GRANTED);
    outgoingGameMessage.setVersion(0);
    outgoingGameMessage.setFieldValueByName('commId', commId);
    outgoingGameMessage.setFieldValueByName('port', commPort);

    // Build the packet
    const packetResult = new BytableMessage();
    packetResult.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
    packetResult.setVersion(0);
    packetResult.deserialize(outgoingGameMessage.serialize());

    return packetResult;
}
