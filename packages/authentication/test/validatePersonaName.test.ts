import { describe, expect, it } from 'vitest';
import { validatePersonaName } from '../src/persona/handlers/validatePersonaName.js';
import { LegacyMessage } from 'rusty-motors-shared';
import { loggerMock } from 'rusty-motors-shared/test';

describe('validatePersonaName', () => {
    it('returns exactly 1 message', async () => {
        const result = await validatePersonaName({
            connectionId: 'test:8228',
            message: new LegacyMessage(),
            log: loggerMock,
        });
        expect(result.messages).toHaveLength(1);
    });

    it('echoes back connectionId', async () => {
        const result = await validatePersonaName({
            connectionId: 'test:8228',
            message: new LegacyMessage(),
            log: loggerMock,
        });
        expect(result.connectionId).toBe('test:8228');
    });

    it('response wire opcode is 0x020A (NPS_DUP_USER) — always rejects new persona names', async () => {
        const result = await validatePersonaName({
            connectionId: 'test:8228',
            message: new LegacyMessage(),
            log: loggerMock,
        });
        const bytes = result.messages[0]!.serialize();
        expect(bytes[0]).toBe(0x02);
        expect(bytes[1]).toBe(0x0a);
    });
});
