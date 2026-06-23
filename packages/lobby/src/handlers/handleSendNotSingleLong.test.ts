import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BytableMessage } from '@rustymotors/binary';

function makeFrame(commId: number, sender: number, filter: number): Buffer {
    const buf = Buffer.alloc(20);
    buf.writeUInt16BE(0x97, 0);
    buf.writeUInt16BE(20, 2);
    buf.writeUInt32BE(commId, 4);
    buf.writeUInt32BE(sender, 8);
    buf.writeUInt32BE(filter, 12);
    buf.writeUInt32BE(0x12345678, 16);
    return buf;
}

const mockPut = vi.fn();
const mockGetSocketQueue = vi.fn(() => ({ put: mockPut }));
const mockGetChannelMembers = vi.fn<() => string[]>();
const mockGetConnectionIdByUserId = vi.fn<() => string | undefined>();
const mockLog = { debug: vi.fn(), warn: vi.fn(), verbose: vi.fn(), info: vi.fn(), error: vi.fn() };

vi.mock('rusty-motors-shared', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        getSocketQueue: mockGetSocketQueue,
        getChannelMembers: mockGetChannelMembers,
        getConnectionIdByUserId: mockGetConnectionIdByUserId,
        getServerLogger: () => mockLog,
    };
});

const { handleSendNotSingleLong } = await import('./handleSendNotSingleLong.js');

function makeMessage(frame: Buffer): BytableMessage {
    return { serialize: () => frame } as unknown as BytableMessage;
}

const SENDER_CONN = 'conn-a';
const PEER_CONN_1 = 'conn-b';
const PEER_CONN_2 = 'conn-c';
const EXCLUDED_CONN = 'conn-d';
const FILTER_USER = 21;
const SENDER_USER = 10;
const COMM_ID = 5;

describe('handleSendNotSingleLong', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('delivers to all channel members except sender and excluded user', async () => {
        const frame = makeFrame(COMM_ID, SENDER_USER, FILTER_USER);
        // Channel has: sender, two peers, one excluded-by-filterUserId
        mockGetChannelMembers.mockReturnValue([SENDER_CONN, PEER_CONN_1, PEER_CONN_2, EXCLUDED_CONN]);
        mockGetConnectionIdByUserId.mockReturnValue(EXCLUDED_CONN);

        const result = await handleSendNotSingleLong({
            connectionId: SENDER_CONN,
            message: makeMessage(frame),
            log: mockLog as never,
        });

        expect(result.messages).toHaveLength(0);
        expect(mockGetChannelMembers).toHaveBeenCalledWith(COMM_ID);
        expect(mockGetConnectionIdByUserId).toHaveBeenCalledWith(FILTER_USER);

        // Only PEER_CONN_1 and PEER_CONN_2 should receive the packet
        expect(mockGetSocketQueue).toHaveBeenCalledTimes(2);
        expect(mockGetSocketQueue).toHaveBeenCalledWith(PEER_CONN_1, 'send');
        expect(mockGetSocketQueue).toHaveBeenCalledWith(PEER_CONN_2, 'send');
        expect(mockGetSocketQueue).not.toHaveBeenCalledWith(SENDER_CONN, 'send');
        expect(mockGetSocketQueue).not.toHaveBeenCalledWith(EXCLUDED_CONN, 'send');
        expect(mockPut).toHaveBeenCalledTimes(2);
    });

    it('delivers rewritten 12-byte envelope (filterUserId stripped)', async () => {
        const frame = makeFrame(COMM_ID, SENDER_USER, FILTER_USER);
        mockGetChannelMembers.mockReturnValue([PEER_CONN_1]);
        mockGetConnectionIdByUserId.mockReturnValue(EXCLUDED_CONN);

        await handleSendNotSingleLong({
            connectionId: SENDER_CONN,
            message: makeMessage(frame),
            log: mockLog as never,
        });

        const sent: Buffer = mockPut.mock.calls[0]![0].data;
        expect(sent.byteLength).toBe(16);
        expect(sent.readUInt16BE(0)).toBe(0x97);
        expect(sent.readUInt16BE(2)).toBe(16);
        expect(sent.readUInt32BE(4)).toBe(COMM_ID);
        expect(sent.readUInt32BE(8)).toBe(SENDER_USER);
        expect(sent.readUInt32BE(12)).toBe(0x12345678); // blob at correct offset
    });

    it('sends to nobody when channel is empty', async () => {
        const frame = makeFrame(COMM_ID, SENDER_USER, FILTER_USER);
        mockGetChannelMembers.mockReturnValue([]);
        mockGetConnectionIdByUserId.mockReturnValue(EXCLUDED_CONN);

        await handleSendNotSingleLong({
            connectionId: SENDER_CONN,
            message: makeMessage(frame),
            log: mockLog as never,
        });

        expect(mockPut).not.toHaveBeenCalled();
    });

    it('sends to nobody when channel has only the sender and excluded user', async () => {
        const frame = makeFrame(COMM_ID, SENDER_USER, FILTER_USER);
        mockGetChannelMembers.mockReturnValue([SENDER_CONN, EXCLUDED_CONN]);
        mockGetConnectionIdByUserId.mockReturnValue(EXCLUDED_CONN);

        await handleSendNotSingleLong({
            connectionId: SENDER_CONN,
            message: makeMessage(frame),
            log: mockLog as never,
        });

        expect(mockPut).not.toHaveBeenCalled();
    });

    it('returns empty messages and warns on a malformed envelope', async () => {
        const frame = Buffer.alloc(8);
        mockGetChannelMembers.mockReturnValue([PEER_CONN_1]);
        mockGetConnectionIdByUserId.mockReturnValue(undefined);

        const result = await handleSendNotSingleLong({
            connectionId: SENDER_CONN,
            message: makeMessage(frame),
            log: mockLog as never,
        });

        expect(result.messages).toHaveLength(0);
        expect(mockPut).not.toHaveBeenCalled();
        expect(mockLog.warn).toHaveBeenCalled();
    });
});
