import { describe, expect, it } from 'vitest';
import { handleSelectGamePersona } from '../src/persona/handleSelectGamePersona.js';
import { NPSMessage } from 'rusty-motors-shared';
import { loggerMock } from 'rusty-motors-shared/test';

describe('handleSelectGamePersona', () => {
    it('returns opcode 0x0207 (NPS_SELECT_GAME_PERSONA_OK)', async () => {
        const result = await handleSelectGamePersona(new NPSMessage(), loggerMock);
        expect(result._header.id).toBe(0x207);
    });

    it('payload is 251 bytes', async () => {
        const result = await handleSelectGamePersona(new NPSMessage(), loggerMock);
        const bytes = result.serialize();
        // 12-byte NPSMessage header + 251-byte payload
        expect(bytes.length).toBe(263);
    });

    it('echoes no connectionId (pure transform — returns NPSMessage directly)', async () => {
        const req = new NPSMessage();
        const result = await handleSelectGamePersona(req, loggerMock);
        expect(result).toBeInstanceOf(NPSMessage);
    });
});
