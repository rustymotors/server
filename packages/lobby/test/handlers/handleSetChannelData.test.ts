import { describe, expect, it, vi } from 'vitest';
import { handleSetChannelData } from '../../src/handlers/handleSetChannelData.js';
import { BytableMessage } from '@rustymotors/binary';
import { loggerMock } from 'rusty-motors-shared/test';

function makeMessage(commId: number, channelData: Buffer): BytableMessage {
    const body = Buffer.alloc(260);
    body.writeInt32BE(commId, 0);
    channelData.copy(body, 4, 0, 256);

    const msg = new BytableMessage();
    msg.deserialize(
        Buffer.concat([
            Buffer.from([0x01, 0x13, 0x01, 0x08]), // header: id=0x113, length=264
            body,
        ]),
    );
    return msg;
}

describe('handleSetChannelData', () => {
    it('returns no response messages for a valid update', async () => {
        const channelData = Buffer.alloc(256, 0xab);
        const message = makeMessage(42, channelData);

        const result = await handleSetChannelData({
            connectionId: 'test-conn-1',
            message,
            log: loggerMock,
        });

        expect(result.connectionId).toBe('test-conn-1');
        expect(result.messages).toHaveLength(0);
    });

    it('logs the commId at debug level', async () => {
        vi.clearAllMocks();
        const message = makeMessage(7, Buffer.alloc(256));

        await handleSetChannelData({
            connectionId: 'test-conn-2',
            message,
            log: loggerMock,
        });

        expect(loggerMock.debug).toHaveBeenCalledWith(
            expect.stringContaining('commId=7'),
        );
    });

    it('logs a warning and returns no messages when body is too short', async () => {
        vi.clearAllMocks();

        const msg = new BytableMessage();
        msg.deserialize(
            Buffer.concat([
                Buffer.from([0x01, 0x13, 0x00, 0x08]), // header only, no body
                Buffer.alloc(4),                        // only 4 bytes of body
            ]),
        );

        const result = await handleSetChannelData({
            connectionId: 'test-conn-3',
            message: msg,
            log: loggerMock,
        });

        expect(loggerMock.warn).toHaveBeenCalledWith(
            expect.stringContaining('body too short'),
        );
        expect(result.messages).toHaveLength(0);
    });
});
