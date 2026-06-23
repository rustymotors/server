import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BytableMessage } from '@rustymotors/binary';

// Build a minimal valid SEND_SINGLE_LONG (0x95) envelope:
//   [opcode:2][len:2][commId:4][senderUserId:4][filterUserId:4][blob:4] = 20 bytes
function makeFrame(opcode: number, commId: number, sender: number, filter: number): Buffer {
    const buf = Buffer.alloc(20);
    buf.writeUInt16BE(opcode, 0);
    buf.writeUInt16BE(20, 2);
    buf.writeUInt32BE(commId, 4);
    buf.writeUInt32BE(sender, 8);
    buf.writeUInt32BE(filter, 12);
    buf.writeUInt32BE(0xdeadbeef, 16);
    return buf;
}

const mockPut = vi.fn();
const mockGetSocketQueue = vi.fn(() => ({ put: mockPut }));
const mockGetConnectionIdByUserId = vi.fn<[number], string | undefined>();
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

const { handleSendSingleLong } = await import('./handleSendSingleLong.js');

function makeMessage(frame: Buffer): BytableMessage {
    return { serialize: () => frame } as unknown as BytableMessage;
}

const SENDER_CONN = 'conn-sender';
const TARGET_CONN = 'conn-target';
const FILTER_USER = 42;
const COMM_ID = 7;
const SENDER_USER = 21;

describe('handleSendSingleLong', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('delivers rewritten envelope to the target connection', async () => {
        const frame = makeFrame(0x95, COMM_ID, SENDER_USER, FILTER_USER);
        mockGetConnectionIdByUserId.mockReturnValue(TARGET_CONN);

        const result = await handleSendSingleLong({
            connectionId: SENDER_CONN,
            message: makeMessage(frame),
            log: mockLog as never,
        });

        expect(result.messages).toHaveLength(0);
        expect(mockGetConnectionIdByUserId).toHaveBeenCalledWith(FILTER_USER);
        expect(mockGetSocketQueue).toHaveBeenCalledWith(TARGET_CONN, 'send');
        expect(mockPut).toHaveBeenCalledOnce();

        // Verify the rewritten envelope: 16 bytes (20 - 4), length field corrected
        const sent: Buffer = mockPut.mock.calls[0][0].data;
        expect(sent.byteLength).toBe(16);
        expect(sent.readUInt16BE(0)).toBe(0x95);
        expect(sent.readUInt16BE(2)).toBe(16);
        expect(sent.readUInt32BE(4)).toBe(COMM_ID);
        expect(sent.readUInt32BE(8)).toBe(SENDER_USER);
        expect(sent.readUInt32BE(12)).toBe(0xdeadbeef);
    });

    it('does not deliver when target is the sender itself', async () => {
        const frame = makeFrame(0x95, COMM_ID, SENDER_USER, FILTER_USER);
        mockGetConnectionIdByUserId.mockReturnValue(SENDER_CONN);

        await handleSendSingleLong({
            connectionId: SENDER_CONN,
            message: makeMessage(frame),
            log: mockLog as never,
        });

        expect(mockPut).not.toHaveBeenCalled();
    });

    it('does not deliver when filterUserId has no known connection', async () => {
        const frame = makeFrame(0x95, COMM_ID, SENDER_USER, FILTER_USER);
        mockGetConnectionIdByUserId.mockReturnValue(undefined);

        await handleSendSingleLong({
            connectionId: SENDER_CONN,
            message: makeMessage(frame),
            log: mockLog as never,
        });

        expect(mockPut).not.toHaveBeenCalled();
    });

    it('returns empty messages and warns on a malformed envelope', async () => {
        const frame = Buffer.alloc(8); // too short for SINGLE header
        mockGetConnectionIdByUserId.mockReturnValue(TARGET_CONN);

        const result = await handleSendSingleLong({
            connectionId: SENDER_CONN,
            message: makeMessage(frame),
            log: mockLog as never,
        });

        expect(result.messages).toHaveLength(0);
        expect(mockPut).not.toHaveBeenCalled();
        expect(mockLog.warn).toHaveBeenCalled();
    });
});
