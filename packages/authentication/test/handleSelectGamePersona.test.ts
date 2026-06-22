import { describe, expect, it } from 'vitest';
import { handleSelectGamePersona } from '../src/persona/handleSelectGamePersona.js';
import { BytableMessage } from '@rustymotors/binary';
import { loggerMock } from 'rusty-motors-shared/test';

describe('handleSelectGamePersona', () => {
    it('returns opcode 0x0207 (NPS_SELECT_GAME_PERSONA_OK)', async () => {
        const result = await handleSelectGamePersona(new BytableMessage(1), loggerMock);
        expect(result.header.id).toBe(0x207);
    });

    it('payload is 251 bytes', async () => {
        const result = await handleSelectGamePersona(new BytableMessage(1), loggerMock);
        const bytes = result.serialize();
        // 12-byte header + 251-byte payload
        expect(bytes.length).toBe(263);
    });

    it('returns a BytableMessage', async () => {
        const req = new BytableMessage(1);
        const result = await handleSelectGamePersona(req, loggerMock);
        expect(result).toBeInstanceOf(BytableMessage);
    });
});
