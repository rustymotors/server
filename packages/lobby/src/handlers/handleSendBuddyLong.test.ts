import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BytableMessage } from '@rustymotors/binary';

function makeFrame(opcode: number, commId: number, sender: number, filter: number): Buffer {
    const buf = Buffer.alloc(20);
    buf.writeUInt16BE(opcode, 0);
    buf.writeUInt16BE(20, 2);
    buf.writeUInt32BE(commId, 4);
    buf.writeUInt32BE(sender, 8);
    buf.writeUInt32BE(filter, 12);
    buf.writeUInt32BE(0xcafebabe, 16);
    return buf;
}

const mockPut = vi.fn();
const mockGetSocketQueue = vi.fn(() => ({ put: mockPut }));
const mockGetConnectionIdByUserId = vi.fn<() => string | undefined>();
const mockLog = { debug: vi.fn(), warn: vi.fn(), verbose: vi.fn(), info: vi.fn(), error: vi.fn() };

vi.mock('rusty-motors-shared', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        getSocketQueue: mockGetSocketQueue,
        getConnectionIdByUserId: mockGetConnectionIdByUserId,
        getServerLogger: () => mockLog,
    };
});

const { handleSendBuddyLong } = await import('./handleSendBuddyLong.js');

function makeMessage(frame: Buffer): BytableMessage {
    return { serialize: () => frame } as unknown as BytableMessage;
}

const SENDER_CONN = 'conn-sender';
const TARGET_CONN = 'conn-buddy';
const FILTER_USER = 99;
const COMM_ID = 3;
const SENDER_USER = 55;

describe('handleSendBuddyLong', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('delivers rewritten envelope to the buddy connection', async () => {
        const frame = makeFrame(0x93, COMM_ID, SENDER_USER, FILTER_USER);
        mockGetConnectionIdByUserId.mockReturnValue(TARGET_CONN);

        const result = await handleSendBuddyLong({
            connectionId: SENDER_CONN,
            message: makeMessage(frame),
            log: mockLog as never,
        });

        expect(result.messages).toHaveLength(0);
        expect(mockGetConnectionIdByUserId).toHaveBeenCalledWith(FILTER_USER);
        expect(mockGetSocketQueue).toHaveBeenCalledWith(TARGET_CONN, 'send');
        expect(mockPut).toHaveBeenCalledOnce();

        const sent: Buffer = mockPut.mock.calls[0]![0].data;
        expect(sent.byteLength).toBe(16);
        expect(sent.readUInt16BE(0)).toBe(0x93);
        expect(sent.readUInt16BE(2)).toBe(16);
        expect(sent.readUInt32BE(4)).toBe(COMM_ID);
        expect(sent.readUInt32BE(8)).toBe(SENDER_USER);
        expect(sent.readUInt32BE(12)).toBe(0xcafebabe);
    });

    it('does not deliver when buddy connection is the sender', async () => {
        const frame = makeFrame(0x93, COMM_ID, SENDER_USER, FILTER_USER);
        mockGetConnectionIdByUserId.mockReturnValue(SENDER_CONN);

        await handleSendBuddyLong({
            connectionId: SENDER_CONN,
            message: makeMessage(frame),
            log: mockLog as never,
        });

        expect(mockPut).not.toHaveBeenCalled();
    });

    it('does not deliver when filterUserId has no known connection', async () => {
        const frame = makeFrame(0x93, COMM_ID, SENDER_USER, FILTER_USER);
        mockGetConnectionIdByUserId.mockReturnValue(undefined);

        await handleSendBuddyLong({
            connectionId: SENDER_CONN,
            message: makeMessage(frame),
            log: mockLog as never,
        });

        expect(mockPut).not.toHaveBeenCalled();
    });

    it('returns empty messages and warns on a malformed envelope', async () => {
        const frame = Buffer.alloc(8);
        mockGetConnectionIdByUserId.mockReturnValue(TARGET_CONN);

        const result = await handleSendBuddyLong({
            connectionId: SENDER_CONN,
            message: makeMessage(frame),
            log: mockLog as never,
        });

        expect(result.messages).toHaveLength(0);
        expect(mockPut).not.toHaveBeenCalled();
        expect(mockLog.warn).toHaveBeenCalled();
    });
});
