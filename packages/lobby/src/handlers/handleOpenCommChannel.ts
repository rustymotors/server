import { BytableMessage } from '@rustymotors/binary';
import {
    ChannelCreated,
    databaseProvider,
    getServerLogger,
    joinChannel,
    getChannelMembers,
    getSocketQueue,
    NPS_MESSAGE_IDS,
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

        const userId: number = (
            incomingRequest.getFieldValueByName("userId") as Buffer
        ).readInt32BE();

        // Record this connection as a member of the channel.
        // Push USER_JOINED_CHANNEL to everyone already in the channel before
        // adding the joiner, so they don't receive their own join event.
        const existingMembers = getChannelMembers(requestedCommId);
        joinChannel(connectionId, requestedCommId);

        const userJoinedMessage = await createUserJoinedChannelMessage(userId, requestedCommId, log, connectionId);

        // Notify existing members of the new arrival.
        for (const memberId of existingMembers) {
            try {
                const sendQueue = getSocketQueue(memberId, 'send');
                sendQueue.put({ sequenceNo: -1, data: userJoinedMessage.serialize() });
            } catch {
                // Member's queue may already be gone; skip silently.
            }
        }


        if (requestedCommId > 100) {


            const channelCreatedBody = new ChannelCreated();
            channelCreatedBody.commId = requestedCommId;
            channelCreatedBody.riff = requestedRiffName.toString();
            channelCreatedBody.protocol = 33;
            channelCreatedBody.channelData.hostID = userId
            channelCreatedBody.channelData.hostName = "Dr Brown"
            channelCreatedBody.channelType = 3;
            channelCreatedBody.maxReadyPlayers = 1;
            channelCreatedBody.channelData.minNPSracers = 0

            const channelCreatedBytable = createBytableMessage(0x20e, channelCreatedBody);

            responsePackets.push(channelCreatedBytable)


        }
        const packetResult = createNPSChannelGrantedPacket(
            requestedCommId,
            grantedPort,
        );



        log.debug(
            `[${connectionId}]  Sending comm GRANTED: ${JSON.stringify(packetResult)}`,
        );


        responsePackets.push(packetResult);

        responsePackets.push(userJoinedMessage);


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

export function createBytableMessage(msgCode: number, body: Serializable): BytableMessage {
    const message = new BytableMessage();
    message.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
    message.setVersion(0);
    message.header.setId(msgCode);
    message.setFieldValueByName('data', body.serialize());
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
        { name: 'riffName', field: 'PString' },             // p
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
        { name: 'password', field: 'PString' },             // p
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