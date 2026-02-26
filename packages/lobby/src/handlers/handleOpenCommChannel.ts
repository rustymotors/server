import { BytableMessage } from '@rustymotors/binary';
import {
    getServerLogger,
    NPS_MESSAGE_IDS,
    RawMessage,
    type Serializable,
} from 'rusty-motors-shared';
import { ServerLogger } from '@rustymotors/logging';
import { createUserJoinedChannelMessage } from './createUserJoinedChannelMessage.js';

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
        const incomingRequest = parseOpenCommChannelMessage(message.serialize());
        
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
            const userId: number = (
                incomingRequest.getFieldValueByName("userId") as Buffer
            ).readInt32BE();

            
            // Create user joined channel message
            const userJoinedMessage = await createUserJoinedChannelMessage(userId, requestedCommIdBuffer, log, connectionId);

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

export function parseOpenCommChannelMessage(buffer: Buffer) {
    const incomingRequest = new BytableMessage();
    incomingRequest.setSerializeOrder([
        { name: 'commId', field: 'Dword' },
        { name: 'riffName', field: 'String' },
        { name: 'slotNumber', field: 'Dword' },
        { name: 'slotFlags', field: 'Dword' },
        { name: 'portNumber', field: 'Dword' },
        { name: 'protocol', field: 'Dword' },
        { name: 'userId', field: 'Dword' },
    ]);
    incomingRequest.deserialize(buffer);
    return incomingRequest;
}