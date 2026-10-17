import { beforeAll, describe, expect, it, vi } from 'vitest';
import { BytableMessage } from '@rustymotors/binary';
import { ReadyForGame, ReadyForGameList } from 'rusty-motors-shared';
import { loggerMock } from 'rusty-motors-shared/test';
import { User } from '../src/lib/User.js';

// ../src/index.js refuses to load without these
vi.stubEnv('PLS_HOST', 'localhost');
vi.stubEnv('PLS_PORT', '7003');

let handleGetReadyList: typeof import('../src/handlers/handleGetReadyList.js').handleGetReadyList;
let getPrimaryRoomServer: typeof import('../src/index.js').getPrimaryRoomServer;

beforeAll(async () => {
    ({ getPrimaryRoomServer } = await import('../src/index.js'));
    ({ handleGetReadyList } = await import('../src/handlers/handleGetReadyList.js'));
});

function makeRequest(commId: number): BytableMessage {
    const body = Buffer.alloc(4);
    body.writeInt32BE(commId, 0);
    const msg = new BytableMessage();
    msg.deserialize(Buffer.concat([Buffer.from([0x02, 0x01, 0x00, 0x08]), body]));
    return msg;
}

// The reply the real client expects, built byte by byte from the same ready list:
// [id 0x0210 BE][total length BE][ready list]
function expectedReply(readyList: ReadyForGameList): Buffer {
    const body = readyList.serialize();
    const header = Buffer.alloc(4);
    header.writeUInt16BE(0x210, 0);
    header.writeUInt16BE(4 + body.length, 2);
    return Buffer.concat([header, body]);
}

describe('handleGetReadyList reply bytes', () => {
    it('is [0x0210][length][empty ready list] when the room does not exist', async () => {
        const result = await handleGetReadyList({
            connectionId: 'conn-1',
            message: makeRequest(0x7fff),
            log: loggerMock,
        });

        expect(result.messages).toHaveLength(1);
        expect(result.messages[0]!.serialize()).toEqual(expectedReply(new ReadyForGameList(12)));
    });

    it('lists every user in the room', async () => {
        const commId = 2; // LOBBY
        const room = getPrimaryRoomServer().getRoomByCommId(commId);
        room.addUser(101, new User(101));
        room.addUser(202, new User(202));

        const readyList = new ReadyForGameList(12);
        for (const user of room.userList.values()) {
            readyList.add(new ReadyForGame(commId, user.userId, true, true));
        }

        const result = await handleGetReadyList({
            connectionId: 'conn-2',
            message: makeRequest(commId),
            log: loggerMock,
        });

        expect(result.connectionId).toBe('conn-2');
        expect(result.messages[0]!.serialize()).toEqual(expectedReply(readyList));
        // two users make the reply longer than the empty one
        expect(result.messages[0]!.serialize().length).toBeGreaterThan(
            expectedReply(new ReadyForGameList(12)).length,
        );
    });
});
