import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BytableMessage } from '@rustymotors/binary';
import { loggerMock } from 'rusty-motors-shared/test';

vi.mock('rusty-motors-shared', async (importOriginal) => {
    const actual = await importOriginal<typeof import('rusty-motors-shared')>();
    return {
        ...actual,
        databaseProvider: {
            getSessionStore: () => ({
                getUser: vi.fn().mockResolvedValue(undefined),
            }),
        },
    };
});

// Import after mock is registered
const { handleGetUserList } = await import('../../src/handlers/handleGetUserList.js');

function makeMessage(commId: number): BytableMessage {
    const body = Buffer.alloc(4);
    body.writeInt32BE(commId, 0);
    const msg = new BytableMessage();
    msg.deserialize(
        Buffer.concat([
            Buffer.from([0x02, 0x11, 0x00, 0x08]), // id=0x211, length=8
            body,
        ]),
    );
    return msg;
}

describe('handleGetUserList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns exactly one message', async () => {
        const result = await handleGetUserList({
            connectionId: 'test:7003',
            message: makeMessage(5),
            log: loggerMock,
        });
        expect(result.messages).toHaveLength(1);
    });

    it('echoes back the connectionId', async () => {
        const result = await handleGetUserList({
            connectionId: 'test:7003',
            message: makeMessage(5),
            log: loggerMock,
        });
        expect(result.connectionId).toBe('test:7003');
    });

    it('response wire opcode is 0x0211 (NPS_USER_LIST)', async () => {
        const result = await handleGetUserList({
            connectionId: 'test:7003',
            message: makeMessage(5),
            log: loggerMock,
        });
        const bytes = result.messages[0]!.serialize();
        expect(bytes[0]).toBe(0x02);
        expect(bytes[1]).toBe(0x11);
    });

    it('returns userCount 0 when session store has no user', async () => {
        const result = await handleGetUserList({
            connectionId: 'test:7003',
            message: makeMessage(5),
            log: loggerMock,
        });
        const bytes = result.messages[0]!.serialize();
        // body: commId(4) + userCount(4) + usersList(0)
        // userCount at offset 8
        expect(bytes.readUInt32BE(8)).toBe(0);
    });
});
