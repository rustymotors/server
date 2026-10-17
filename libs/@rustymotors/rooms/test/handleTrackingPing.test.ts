import { describe, expect, it } from 'vitest';
import { BytableMessage } from '@rustymotors/binary';
import { handleTrackingPing } from '../src/handlers/handleTrackingPing.js';

describe('handleTrackingPing', () => {
    it('replies with a header-only message: id 0x217, length 4, no payload', async () => {
        const result = await handleTrackingPing({
            connectionId: 'conn-1',
            message: new BytableMessage(),
        });

        expect(result.connectionId).toBe('conn-1');
        expect(result.messages).toHaveLength(1);
        // The bytes the real client has always received: 02 17 00 04
        expect(result.messages[0]!.serialize().toString('hex')).toBe('02170004');
    });

    it('builds a fresh reply for every ping', async () => {
        const first = await handleTrackingPing({ connectionId: 'a', message: new BytableMessage() });
        const second = await handleTrackingPing({ connectionId: 'b', message: new BytableMessage() });

        expect(first.messages[0]).not.toBe(second.messages[0]);
        expect(second.messages[0]!.serialize().toString('hex')).toBe('02170004');
    });
});
