import { describe, expect, it } from 'vitest';
import { handleSendRiffList } from '../../src/handlers/handleSendRiffList.js';
import { BytableMessage } from '@rustymotors/binary';
import { loggerMock } from 'rusty-motors-shared/test';

describe('handleSendRiffList', () => {
    it('returns exactly one message', async () => {
        const result = await handleSendRiffList({
            connectionId: 'test:7003',
            message: new BytableMessage(),
            log: loggerMock,
        });
        expect(result.messages).toHaveLength(1);
    });

    it('echoes back the connectionId', async () => {
        const result = await handleSendRiffList({
            connectionId: 'test:7003',
            message: new BytableMessage(),
            log: loggerMock,
        });
        expect(result.connectionId).toBe('test:7003');
    });

    it('response wire opcode is 0x0401 (NPS_RIFF_LIST)', async () => {
        const result = await handleSendRiffList({
            connectionId: 'test:7003',
            message: new BytableMessage(),
            log: loggerMock,
        });
        const bytes = result.messages[0]!.serialize();
        expect(bytes[0]).toBe(0x04);
        expect(bytes[1]).toBe(0x01);
    });

    it('returns an empty riff list (no rooms wired yet)', async () => {
        const result = await handleSendRiffList({
            connectionId: 'test:7003',
            message: new BytableMessage(),
            log: loggerMock,
        });
        const bytes = result.messages[0]!.serialize();
        // header(4) + structSize(4) + numRiffs(4) = 12 bytes minimum with 0 riffs
        expect(bytes.length).toBe(12);
        // numRiffs at offset 8 should be 0
        expect(bytes.readUInt32BE(8)).toBe(0);
    });
});
