import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleGetServerInfo } from '../../src/handlers/handleGetServerInfo.js';
import { BytableMessage } from '@rustymotors/binary';
import { databaseProvider } from 'rusty-motors-shared';
import type { ISessionStore } from 'rusty-motors-shared';
import { loggerMock } from 'rusty-motors-shared/test';

function makeMessage(commId: number): BytableMessage {
    const body = Buffer.alloc(4);
    body.writeInt32BE(commId, 0);
    const msg = new BytableMessage();
    msg.deserialize(
        Buffer.concat([
            Buffer.from([0x01, 0x0c, 0x00, 0x08]), // id=0x10c, length=8
            body,
        ]),
    );
    return msg;
}

describe('handleGetServerInfo', () => {
    describe('cID=10001 (MC100 channel)', () => {
        it('returns exactly one message', async () => {
            const result = await handleGetServerInfo({
                connectionId: 'test:7003',
                message: makeMessage(10001),
                log: loggerMock,
            });
            expect(result.messages).toHaveLength(1);
        });

        it('echoes back the connectionId', async () => {
            const result = await handleGetServerInfo({
                connectionId: 'test:7003',
                message: makeMessage(10001),
                log: loggerMock,
            });
            expect(result.connectionId).toBe('test:7003');
        });

        it('response wire opcode is 0x020D (NPS_SERVER_INFO)', async () => {
            const result = await handleGetServerInfo({
                connectionId: 'test:7003',
                message: makeMessage(10001),
                log: loggerMock,
            });
            const bytes = result.messages[0]!.serialize();
            expect(bytes[0]).toBe(0x02);
            expect(bytes[1]).toBe(0x0d);
        });

        it('response body commId matches requested commId', async () => {
            const result = await handleGetServerInfo({
                connectionId: 'test:7003',
                message: makeMessage(10001),
                log: loggerMock,
            });
            const bytes = result.messages[0]!.serialize();
            // header(4) + riffName PString('MC100': prefix=6, content=6) = 10 bytes before commId
            expect(bytes.readInt32BE(14)).toBe(10001);
        });
    });

    describe('cID=1 (chat channel)', () => {
        it('returns exactly one message', async () => {
            const result = await handleGetServerInfo({
                connectionId: 'test:7003',
                message: makeMessage(1),
                log: loggerMock,
            });
            expect(result.messages).toHaveLength(1);
        });

        it('response wire opcode is 0x020D (NPS_SERVER_INFO)', async () => {
            const result = await handleGetServerInfo({
                connectionId: 'test:7003',
                message: makeMessage(1),
                log: loggerMock,
            });
            const bytes = result.messages[0]!.serialize();
            expect(bytes[0]).toBe(0x02);
            expect(bytes[1]).toBe(0x0d);
        });
    });

    describe('cID=200 (game server from DB)', () => {
        const mockSessionStore: ISessionStore = {
            updateSessionKey: vi.fn(),
            fetchSessionKeyByCustomerId: vi.fn(),
            fetchSessionKeyByConnectionId: vi.fn(),
            updateUser: vi.fn(),
            getUser: vi.fn(),
            updateConnection: vi.fn(),
            findUserByConnectionId: vi.fn(),
            updateGameServer: vi.fn(),
            getGameServers: vi.fn(),
        };

        beforeEach(() => {
            databaseProvider.register({
                session: mockSessionStore,
                gameData: {} as never,
                auth: {} as never,
            });
        });

        afterEach(() => {
            databaseProvider.unregister();
            vi.clearAllMocks();
        });

        it('returns exactly one message when game server is found', async () => {
            vi.mocked(mockSessionStore.getGameServers).mockResolvedValue([
                { commId: 200, ipAddress: '10.0.0.1', port: 9200, userId: 21, numberOfPlayers: 0, riff: 'RACE', serialize: () => Buffer.alloc(0) },
            ]);
            const result = await handleGetServerInfo({
                connectionId: 'test:7003',
                message: makeMessage(200),
                log: loggerMock,
            });
            expect(result.messages).toHaveLength(1);
        });

        it('response wire opcode is 0x020D (NPS_SERVER_INFO)', async () => {
            vi.mocked(mockSessionStore.getGameServers).mockResolvedValue([
                { commId: 200, ipAddress: '10.0.0.1', port: 9200, userId: 21, numberOfPlayers: 0, riff: 'RACE', serialize: () => Buffer.alloc(0) },
            ]);
            const result = await handleGetServerInfo({
                connectionId: 'test:7003',
                message: makeMessage(200),
                log: loggerMock,
            });
            const bytes = result.messages[0]!.serialize();
            expect(bytes[0]).toBe(0x02);
            expect(bytes[1]).toBe(0x0d);
        });

        it('throws when commId is not in the game server list', async () => {
            vi.mocked(mockSessionStore.getGameServers).mockResolvedValue([]);
            await expect(
                handleGetServerInfo({
                    connectionId: 'test:7003',
                    message: makeMessage(200),
                    log: loggerMock,
                }),
            ).rejects.toThrow();
        });
    });
});
