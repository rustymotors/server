import { BytableMessage } from '@rustymotors/binary';
import { getServerLogger, type ServerLogger } from 'rusty-motors-shared';
import { getPrimaryRoomServer } from '../index.js';

export async function handleGetUserList({
    connectionId,
    message,
    log = getServerLogger('rooms.handleGetUserList'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: BytableMessage[] }> {
    const request = new BytableMessage();
    request.setSerializeOrder([{ name: 'commId', field: 'Dword' }]);
    request.deserialize(message.serialize());

    const commId = (request.getFieldValueByName('commId') as Buffer).readInt32BE();
    log.debug(`[${connectionId}] NPS_GET_USER_LIST commId=${commId}`);

    const server = getPrimaryRoomServer();
    const room = server.getRoomByCommId(commId);

    let usersBuffer = Buffer.alloc(0);
    let userCount = 0;

    if (room) {
        for (const user of room.userList.values()) {
            if (user.userData) {
                // UserInfo wire format: userId(4) + nameLen(4) + name(aligned) + userData(64)
                const nameBytes = Buffer.from(user.userName + '\0', 'utf8');
                const nameLen = nameBytes.length;
                const alignedNameLen = Math.ceil(nameLen / 4) * 4;
                const userIdBuf = Buffer.alloc(4);
                userIdBuf.writeInt32BE(user.userId);
                const nameLenBuf = Buffer.alloc(4);
                nameLenBuf.writeUInt32BE(nameLen);
                const nameBuf = Buffer.alloc(alignedNameLen);
                nameBytes.copy(nameBuf);
                const entry = Buffer.concat([userIdBuf, nameLenBuf, nameBuf, user.userData.serialize()]);
                usersBuffer = Buffer.concat([usersBuffer, entry]);
                userCount++;
            }
        }
    }

    const outgoing = new BytableMessage();
    outgoing.setSerializeOrder([
        { name: 'commId', field: 'Dword' },
        { name: 'userCount', field: 'Dword' },
        { name: 'usersList', field: 'Buffer' },
    ]);
    outgoing.header.setId(0x211);
    outgoing.setVersion(0);
    outgoing.setFieldValueByName('commId', commId);
    outgoing.setFieldValueByName('userCount', userCount);
    outgoing.setFieldValueByName('usersList', usersBuffer);

    const packet = new BytableMessage();
    packet.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
    packet.setVersion(0);
    packet.deserialize(outgoing.serialize());

    return { connectionId, messages: [packet] };
}
