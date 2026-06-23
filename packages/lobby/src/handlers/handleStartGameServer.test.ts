import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BytableMessage } from '@rustymotors/binary';

const {
    mockPut,
    mockGetSocketQueue,
    mockGetChannelMembers,
    mockFindUserByConnectionId,
    mockUpdateGameServer,
    mockCreateUserJoinedChannelMessage,
    mockLog,
} = vi.hoisted(() => {
    const mockPut = vi.fn();
    const mockLog = { debug: vi.fn(), warn: vi.fn(), verbose: vi.fn(), info: vi.fn(), error: vi.fn() };
    const mockJoinedMsg = { header: { id: 0xffff }, serialize: () => Buffer.from([0x01, 0x02]) };
    return {
        mockPut,
        mockGetSocketQueue: vi.fn(() => ({ put: mockPut })),
        mockGetChannelMembers: vi.fn<[number], string[]>(),
        mockFindUserByConnectionId: vi.fn<[string], Promise<number | undefined>>(),
        mockUpdateGameServer: vi.fn(),
        mockCreateUserJoinedChannelMessage: vi.fn(async () => mockJoinedMsg as unknown as BytableMessage),
        mockLog,
    };
});

vi.mock('rusty-motors-shared', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        getSocketQueue: mockGetSocketQueue,
        getChannelMembers: mockGetChannelMembers,
        getServerLogger: () => mockLog,
        databaseProvider: {
            getSessionStore: () => ({
                findUserByConnectionId: mockFindUserByConnectionId,
                updateGameServer: mockUpdateGameServer,
            }),
        },
    };
});

vi.mock('./createUserJoinedChannelMessage.js', () => ({
    createUserJoinedChannelMessage: mockCreateUserJoinedChannelMessage,
}));

const { handleStartGameServer } = await import('./handleStartGameServer.js');

const COMM_ID = 12;
const HOST_CONN = 'conn-host';
const PEER_CONN = 'conn-peer';
const HOST_USER_ID = 5;

// GameServerLaunchInfo wire format: [commId:4 BE][CString: [len:4 BE][data+null]]
// "127.0.0.1" = 9 chars + null = 10 bytes; total body = 4 + 4 + 10 = 18 bytes
function makeLaunchMessage(): BytableMessage {
    const host = '127.0.0.1';
    const body = Buffer.alloc(4 + 4 + host.length + 1);
    body.writeInt32BE(COMM_ID, 0);
    body.writeInt32BE(host.length + 1, 4);  // CString length includes null
    body.write(host + '\0', 8, 'utf8');
    return {
        header: { id: 0x010a },
        getBody: () => body,
        serialize: () => body,
    } as unknown as BytableMessage;
}

describe('handleStartGameServer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFindUserByConnectionId.mockResolvedValue(HOST_USER_ID);
        mockGetChannelMembers.mockReturnValue([HOST_CONN]);
    });

    it('returns three response packets to the host', async () => {
        const result = await handleStartGameServer({
            connectionId: HOST_CONN,
            message: makeLaunchMessage(),
            log: mockLog as never,
        });

        expect(result.connectionId).toBe(HOST_CONN);
        expect(result.messages).toHaveLength(3);
        const ids = result.messages.map(m => (m as unknown as { header: { id: number } }).header?.id);
        expect(ids[0]).toBe(0x20d);  // NPS_SERVER_INFO
        expect(ids[2]).toBe(0x21c);  // NPS_GAME_SERVER_STARTED
    });

    it('broadcasts all three packets to peer connections in the channel', async () => {
        mockGetChannelMembers.mockReturnValue([HOST_CONN, PEER_CONN]);

        await handleStartGameServer({
            connectionId: HOST_CONN,
            message: makeLaunchMessage(),
            log: mockLog as never,
        });

        expect(mockGetSocketQueue).toHaveBeenCalledWith(PEER_CONN, 'send');
        expect(mockPut).toHaveBeenCalledTimes(3);
    });

    it('does not push to the host via socket queue (host gets response array)', async () => {
        mockGetChannelMembers.mockReturnValue([HOST_CONN, PEER_CONN]);

        await handleStartGameServer({
            connectionId: HOST_CONN,
            message: makeLaunchMessage(),
            log: mockLog as never,
        });

        expect(mockGetSocketQueue).not.toHaveBeenCalledWith(HOST_CONN, 'send');
    });

    it('throws when userId cannot be found for the connection', async () => {
        mockFindUserByConnectionId.mockResolvedValue(undefined);

        await expect(
            handleStartGameServer({
                connectionId: HOST_CONN,
                message: makeLaunchMessage(),
                log: mockLog as never,
            }),
        ).rejects.toThrow(/Error handling NPS_START_GAME_SERVER/);
    });
});
