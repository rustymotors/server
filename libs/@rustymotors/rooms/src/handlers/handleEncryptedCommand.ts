import { BytableBuffer, BytableMessage, createRawMessage } from '@rustymotors/binary';
import {
    fetchStateFromDatabase,
    getEncryption,
    getServerLogger,
    NPS_MESSAGE_IDS,
    type ServerLogger,
    updateEncryption,
} from 'rusty-motors-shared';
import { handleCloseCommChannel } from './handleCloseCommChannel.js';
import { handleOpenCommChannel } from './handleOpenCommChannel.js';
import { handleGetReadyList } from './handleGetReadyList.js';
import { handleGetMiniUserList } from './handleGetMiniUserList.js';
import { handleGetServerInfo } from './handleGetServerInfo.js';
import { handleGetUserList } from './handleGetUserList.js';
import { handleSendBuddyLong } from './handleSendBuddyLong.js';
import { handleSendGameServersList } from './handleSendGameServersList.js';
import { handleSendMiniRiffList } from './handleSendMiniRiffList.js';
import { handleSendNotSingleLong } from './handleSendNotSingleLong.js';
import { handleSendRiffList } from './handleSendRiffList.js';
import { handleSendSingleLong } from './handleSendSingleLong.js';
import { handleSetChannelData } from './handleSetChannelData.js';
import { handleSetChannelFlags } from './handleSetChannelFlags.js';
import { handleSetMyUserData } from './handleSetMyUserData.js';
import { handleStartGameServer } from './handleStartGameServer.js';

type InnerHandler = (args: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}) => Promise<{ connectionId: string; messages: { serialize(): Buffer }[] }>;

const innerHandlers: { opCode: number; handler: InnerHandler }[] = [
    { opCode: NPS_MESSAGE_IDS.GET_USER_LIST, handler: handleGetUserList },
    { opCode: NPS_MESSAGE_IDS.OPEN_COMM_CHANNEL, handler: handleOpenCommChannel },
    { opCode: NPS_MESSAGE_IDS.CLOSE_COMM_CHANNEL, handler: handleCloseCommChannel },
    { opCode: NPS_MESSAGE_IDS.GET_READY_LIST, handler: handleGetReadyList },
    { opCode: NPS_MESSAGE_IDS.SET_CHANNEL_DATA, handler: handleSetChannelData },
    { opCode: NPS_MESSAGE_IDS.SET_COMM_FLAGS, handler: handleSetChannelFlags },
    { opCode: NPS_MESSAGE_IDS.SEND_RIFF_LIST, handler: handleSendRiffList },
    { opCode: NPS_MESSAGE_IDS.SEND_MINI_RIFF_LIST, handler: handleSendMiniRiffList },
    { opCode: NPS_MESSAGE_IDS.START_GAME_SERVER, handler: handleStartGameServer },
    { opCode: NPS_MESSAGE_IDS.SEND_GAME_SERVERS_LIST, handler: handleSendGameServersList },
    { opCode: NPS_MESSAGE_IDS.GET_SERVER_INFO, handler: handleGetServerInfo },
    { opCode: NPS_MESSAGE_IDS.GET_MINI_USER_LIST, handler: handleGetMiniUserList },
    { opCode: NPS_MESSAGE_IDS.SET_MY_USER_DATA, handler: handleSetMyUserData },
    { opCode: NPS_MESSAGE_IDS.SEND_BUDDY_LONG, handler: handleSendBuddyLong },
    { opCode: NPS_MESSAGE_IDS.SEND_SINGLE_LONG, handler: handleSendSingleLong },
    { opCode: NPS_MESSAGE_IDS.SEND_NOT_SINGLE_LONG, handler: handleSendNotSingleLong },
];

function decryptBody(connectionId: string, message: BytableMessage): BytableMessage {
    const state = fetchStateFromDatabase();
    const encryption = getEncryption(state, connectionId);
    if (!encryption) {
        throw new Error(`No encryption session for ${connectionId}`);
    }
    const result = encryption.commandEncryption.decrypt(message.getBody());
    updateEncryption(state, encryption).save();
    return createRawMessage(result);
}

function encryptMessage(connectionId: string, message: { serialize(): Buffer }): BytableBuffer {
    const state = fetchStateFromDatabase();
    const encryption = getEncryption(state, connectionId);
    if (!encryption) {
        throw new Error(`No encryption session for ${connectionId}`);
    }
    let plain = message.serialize();
    if (plain.length % 8 !== 0) {
        plain = Buffer.concat([plain, Buffer.alloc(8 - (plain.length % 8))]);
    }
    const encrypted = encryption.commandEncryption.encrypt(plain);
    updateEncryption(state, encryption).save();

    const wrapper = createRawMessage();
    wrapper.header.setId(0x1101);
    wrapper.setBody(encrypted);

    const out = new BytableBuffer();
    out.deserialize(wrapper.serialize());
    return out;
}

export async function handleEncryptedCommand({
    connectionId,
    message,
    log = getServerLogger('rooms.handleEncryptedCommand'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: BytableBuffer[] }> {
    const deciphered = decryptBody(connectionId, message);
    const opCode = deciphered.header.id;

    log.debug(`[${connectionId}] inner opCode=0x${opCode.toString(16)}`);

    const entry = innerHandlers.find((h) => h.opCode === opCode);
    if (!entry) {
        log.error(`[${connectionId}] unsupported inner opCode=0x${opCode.toString(16)}`);
        return { connectionId, messages: [] };
    }

    const { messages } = await entry.handler({ connectionId, message: deciphered, log });

    const encrypted = messages.map((m) => encryptMessage(connectionId, m));
    return { connectionId, messages: encrypted };
}
