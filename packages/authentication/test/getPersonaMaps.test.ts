import { describe, expect, it } from 'vitest';
import { getPersonaMaps } from '../src/persona/getPersonaMaps.js';
import { LegacyMessage } from 'rusty-motors-shared';
import { loggerMock } from 'rusty-motors-shared/test';

function makeMessage(customerId: number): LegacyMessage {
    const payload = Buffer.alloc(12);
    payload.writeUInt32BE(customerId, 8); // customerId is at offset 8 in payload
    const msg = new LegacyMessage();
    msg.setBuffer(payload);
    return msg;
}

describe('getPersonaMaps', () => {
    describe('known customerId (5551212 → "Dr Brown")', () => {
        it('returns exactly 1 message', async () => {
            const result = await getPersonaMaps({
                connectionId: 'test:8228',
                message: makeMessage(5551212),
                log: loggerMock,
            });
            expect(result.messages).toHaveLength(1);
        });

        it('echoes back connectionId', async () => {
            const result = await getPersonaMaps({
                connectionId: 'test:8228',
                message: makeMessage(5551212),
                log: loggerMock,
            });
            expect(result.connectionId).toBe('test:8228');
        });

        it('response wire opcode is 0x0607 (GET_PERSONA_MAPS_REPLY)', async () => {
            const result = await getPersonaMaps({
                connectionId: 'test:8228',
                message: makeMessage(5551212),
                log: loggerMock,
            });
            const bytes = result.messages[0]!.serialize();
            expect(bytes[0]).toBe(0x06);
            expect(bytes[1]).toBe(0x07);
        });
    });

    describe('unknown customerId', () => {
        it('returns exactly 1 message (empty persona list)', async () => {
            const result = await getPersonaMaps({
                connectionId: 'test:8228',
                message: makeMessage(999),
                log: loggerMock,
            });
            expect(result.messages).toHaveLength(1);
        });

        it('response wire opcode is 0x0607 regardless of empty list', async () => {
            const result = await getPersonaMaps({
                connectionId: 'test:8228',
                message: makeMessage(999),
                log: loggerMock,
            });
            const bytes = result.messages[0]!.serialize();
            expect(bytes[0]).toBe(0x06);
            expect(bytes[1]).toBe(0x07);
        });
    });
});
