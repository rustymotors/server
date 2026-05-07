import { describe, expect, it } from 'vitest';
import { handleSetChannelFlags } from '../../src/handlers/handlSetChannelFlags.js';
import { BytableMessage } from '@rustymotors/binary';
import { loggerMock } from 'rusty-motors-shared/test';

describe('handleSetChannelFlags', () => {
    it('returns 0 messages', async () => {
        const result = await handleSetChannelFlags({
            connectionId: 'test:7003',
            message: new BytableMessage(),
            log: loggerMock,
        });
        expect(result.messages).toHaveLength(0);
    });

    it('echoes back connectionId', async () => {
        const result = await handleSetChannelFlags({
            connectionId: 'test:7003',
            message: new BytableMessage(),
            log: loggerMock,
        });
        expect(result.connectionId).toBe('test:7003');
    });
});
