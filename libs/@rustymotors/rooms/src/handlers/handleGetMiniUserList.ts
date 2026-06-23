import { BytableMessage, BytableStructure } from '@rustymotors/binary';
import { getServerLogger, LegacyMessage, type ServerLogger } from 'rusty-motors-shared';
import { getPrimaryRoomServer } from '../index.js';

class MiniUserInfo extends BytableStructure {
    constructor() {
        super();
        this.setSerializeOrder([
            { name: 'userId', field: 'Dword' },
            { name: 'userName', field: 'PString' },
        ]);
    }
}

export async function handleGetMiniUserList({
    connectionId,
    message,
    log = getServerLogger('rooms.handleGetMiniUserList'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: BytableMessage[] }> {
    const commId = message.getBody().readUInt32BE(0);
    log.debug(`[${connectionId}] NPS_GET_MINI_USER_LIST commId=${commId}`);

    const server = getPrimaryRoomServer();
    const room = server.getRoomByCommId(commId);
    const users = room ? Array.from(room.userList.values()) : [];

    const channelCountRecord = Buffer.alloc(8);
    channelCountRecord.writeUInt32BE(commId, 0);
    channelCountRecord.writeUInt32BE(users.length, 4);

    const userBuffers = users.map((user) => {
        const info = new MiniUserInfo();
        info.setFieldValueByName('userId', user.userId);
        info.setFieldValueByName('userName', user.userName);
        return info.serialize();
    });

    const realData = Buffer.concat([channelCountRecord, ...userBuffers]);
    const pad = realData.length % 8 === 0 ? 0 : 8 - (realData.length % 8);
    const packetContent = Buffer.concat([realData, Buffer.alloc(pad)]);

    const outgoing = new LegacyMessage();
    outgoing.setMessageId(0x229); // NPS_MINI_USER_LIST
    outgoing.setBuffer(packetContent);

    const packet = new BytableMessage();
    packet.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
    packet.deserialize(outgoing.serialize());

    return { connectionId, messages: [packet] };
}
