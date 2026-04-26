import { BytableMessage } from '@rustymotors/binary';
import {
    databaseProvider,
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

        const connectionPort = Number.parseInt(connectionId.split(':')[1] ?? '7003');
        let grantedPort = connectionPort;

        if (requestedCommId > 100) {
            const sessionStore = databaseProvider.getSessionStore();
            const gameServers = await sessionStore.getGameServers();
            const gameServer = gameServers.find((s) => s.commId === requestedCommId);
            if (gameServer) {
                grantedPort = gameServer.port;
            }
        }

        const responsePackets = [];

        const packetResult = createNPSChannelGrantedPacket(
            requestedCommId,
            grantedPort,
        );
        log.debug(
            `[${connectionId}]  Sending comm GRANTED: ${JSON.stringify(packetResult)}`,
        );

        responsePackets.push(packetResult);

        if (requestedCommId > 100) {
            const userId: number = (
                incomingRequest.getFieldValueByName("userId") as Buffer
            ).readInt32BE();

            const userJoinedMessage = await createUserJoinedChannelMessage(userId, requestedCommId, log, connectionId);

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
//   uVar23 = param_3->Flags;
//   uVar22 = 256;
//   pcVar21 = param_3->ChannelData;
//   lVar20 = param_3->SendRate;
//   lVar19 = param_3->SKU;
//   uVar9 = (uint)param_3->MaxReadyPlayers;
//   iVar6 = (int)param_3->LaunchGameServer;
//   iVar1 = (int)param_3->GameServerIsRunning;
//   iVar10 = (int)param_3->DisableBacklog;
//   sVar2 = _strlen(param_3->Password);
//   iVar3 = sVar2 + 1;
//   pcVar18 = param_3->Password;
//   iVar4 = (int)param_3->ChannelType;
//   iVar11 = (int)param_3->IsMaster;
//   iVar7 = (int)param_3->GameReady;
//   iVar5 = (int)param_3->CanReady;
//   iVar12 = (int)param_3->OpenChannels;
//   iVar8 = (int)param_3->ConnectedUsers;
//   lVar17 = param_3->UserId;
//   lVar16 = param_3->Protocol;
//   lVar15 = param_3->Port;
//   lVar14 = param_3->SlotFlags;
//   lVar13 = param_3->SlotNumber;
//   sVar2 = _strlen(param_3->Riff);
//   iVar1 = NPS_Pack::pack((NPS_Pack *)param_2,(uchar *)this,(int)param_1,(char *)param_2,
//                          "lplllllsssssspscssllbl",param_3->CommId,param_3->Riff,sVar2 + 1,lVar13,
//                          lVar14,lVar15,lVar16,lVar17,iVar8,iVar12,iVar5,iVar7,iVar11,iVar4,pcVar18,
//                          iVar3,iVar10,iVar1,iVar6,uVar9,lVar19,lVar20,pcVar21,uVar22,uVar23);

    
    const incomingRequest = new BytableMessage();
    incomingRequest.setSerializeOrder([
        { name: 'commId', field: 'Dword' },               // l
        { name: 'riffName', field: 'String' },             // p
        { name: 'slotNumber', field: 'Dword' },            // l
        { name: 'slotFlags', field: 'Dword' },             // l
        { name: 'portNumber', field: 'Dword' },            // l
        { name: 'protocol', field: 'Dword' },              // l
        { name: 'userId', field: 'Dword' },                // l
        { name: 'connectedUsers', field: 'Short' },        // s
        { name: 'openChannels', field: 'Short' },          // s
        { name: 'canReady', field: 'Short' },              // s
        { name: 'gameReady', field: 'Short' },             // s
        { name: 'isMaster', field: 'Short' },              // s
        { name: 'channelType', field: 'Short' },           // s
        { name: 'password', field: 'String' },             // p
        { name: 'disableBacklog', field: 'Short' },        // s
        { name: 'gameServerIsRunning', field: 'Boolean' }, // c
        { name: 'launchGameServer', field: 'Short' },      // s
        { name: 'maxReadyPlayers', field: 'Short' },       // s
        { name: 'sku', field: 'Dword' },                   // l
        { name: 'sendRate', field: 'Dword' },              // l
        { name: 'channelData', field: 'ChannelData' },          // b (256-byte block)
        { name: 'flags', field: 'Dword' },                 // l
    ]);
    incomingRequest.deserialize(buffer);
    return incomingRequest;
}