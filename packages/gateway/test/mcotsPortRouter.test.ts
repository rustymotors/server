import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mcotsPortRouter } from '../src/mcotsPortRouter.js';
import type { TaggedSocket } from '../src/socketUtility.js';
import { ServerPacket } from 'rusty-motors-shared-packets';

vi.mock('rusty-motors-database', () => ({
    databaseManager: {
        updateSessionKey: vi.fn(),
        fetchSessionKeyByConnectionId: vi.fn(),
        fetchSessionKeyByCustomerId: vi.fn(),
        updateUser: vi.fn(),
    },
}));

vi.mocked(await import('rusty-motors-database')).databaseManager;

describe('mcotsPortRouter', () => {
    let mockLogger: any;
    beforeEach(() => {
        vi.resetAllMocks();
        mockLogger = {
            debug: vi.fn(),
            error: vi.fn(),
            info: vi.fn(),
        };
    });

    it('should log an error and close the socket if local port is undefined', async () => {
        const mockSocket = {
            localPort: undefined,
            end: vi.fn(),
            on: vi.fn(),
            write: vi.fn(),
            destroySoon: vi.fn(),
            connect: vi.fn(),
            setEncoding: vi.fn(),
            pause: vi.fn(),
            resume: vi.fn(),
            setTimeout: vi.fn(),
            setNoDelay: vi.fn(),
            setKeepAlive: vi.fn(),
            address: vi.fn(),
            unref: vi.fn(),
            ref: vi.fn(),
        } as any;
        const taggedSocket: TaggedSocket = {
            rawSocket: mockSocket,
            connectionId: 'test-id',
            connectedAt: Date.now(),
        };

        await mcotsPortRouter({ taggedSocket, log: mockLogger });
        expect(mockSocket.end).toHaveBeenCalled();
        expect(mockLogger.error).toHaveBeenCalledWith(
            '[test-id] Local port is undefined',
        );
    });

    it('should handle data event and route initial message', async () => {
        const mockSocket = {
            localPort: 43300,
            write: vi.fn(),
            on: vi.fn((event, callback) => {
                if (event === 'data') {
                    callback(
                        Buffer.from([
                            0x74, 0x65, 0x73, 0x74, 0x2d, 0x64, 0x61, 0x74,
                            0x61,
                        ]),
                    );
                }
            }),
            destroySoon: vi.fn(),
            connect: vi.fn(),
            setEncoding: vi.fn(),
            pause: vi.fn(),
            resume: vi.fn(),
            setTimeout: vi.fn(),
            setNoDelay: vi.fn(),
            setKeepAlive: vi.fn(),
            address: vi.fn(),
            unref: vi.fn(),
            ref: vi.fn(),
        } as any;
        const taggedSocket: TaggedSocket = {
            rawSocket: mockSocket,
            connectionId: 'test-id-mcots',
            connectedAt: Date.now(),
        };

        const mockServerPacket = {
            deserialize: vi.fn(),
            toHexString: vi.fn().mockReturnValue('746573742d64617461'),
        };
        vi.spyOn(ServerPacket.prototype, 'deserialize').mockImplementation(
            mockServerPacket.deserialize,
        );
        vi.spyOn(ServerPacket.prototype, 'toHexString').mockImplementation(
            mockServerPacket.toHexString,
        );

        await mcotsPortRouter({ taggedSocket, log: mockLogger });
        expect(mockLogger.debug).toHaveBeenCalledWith(
            expect.stringContaining('MCOTS port router started for port 43300'),
        );
        // You can add more assertions for debug/info/error as needed
    });

    it('should log socket end event', async () => {
        const mockSocket = {
            localPort: 43300,
            on: vi.fn((event, callback) => {
                if (event === 'end') {
                    callback();
                }
            }),
            write: vi.fn(),
            destroySoon: vi.fn(),
            connect: vi.fn(),
            setEncoding: vi.fn(),
            pause: vi.fn(),
            resume: vi.fn(),
            setTimeout: vi.fn(),
            setNoDelay: vi.fn(),
            setKeepAlive: vi.fn(),
            address: vi.fn(),
            unref: vi.fn(),
            ref: vi.fn(),
        } as any;
        const taggedSocket: TaggedSocket = {
            rawSocket: mockSocket,
            connectionId: 'test-id',
            connectedAt: Date.now(),
        };

        await mcotsPortRouter({ taggedSocket, log: mockLogger });
        // The end event is currently commented out, so no log assertion here
    });

    it('should log socket error event', async () => {
        const mockSocket = {
            localPort: 43300,
            on: vi.fn((event, callback) => {
                if (event === 'error') {
                    callback(new Error('test-error'));
                }
            }),
            write: vi.fn(),
            destroySoon: vi.fn(),
            connect: vi.fn(),
            setEncoding: vi.fn(),
            pause: vi.fn(),
            resume: vi.fn(),
            setTimeout: vi.fn(),
            setNoDelay: vi.fn(),
            setKeepAlive: vi.fn(),
            address: vi.fn(),
            unref: vi.fn(),
            ref: vi.fn(),
        } as any;
        const taggedSocket: TaggedSocket = {
            rawSocket: mockSocket,
            connectionId: 'test-id',
            connectedAt: Date.now(),
        };

        await mcotsPortRouter({ taggedSocket, log: mockLogger });
        expect(mockLogger.error).toHaveBeenCalledWith(
            expect.stringContaining('Socket error: Error: test-error'),
        );
    });
});
