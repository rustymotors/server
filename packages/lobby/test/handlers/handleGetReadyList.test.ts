import { describe, expect, it } from 'vitest';
import { handleGetReadyList } from '../../src/handlers/handleGetReadyList.js';
import { BytableMessage } from '@rustymotors/binary';
import { loggerMock } from 'rusty-motors-shared/test';

function makeMessage(commId: number): BytableMessage {
    const body = Buffer.alloc(4);
    body.writeInt32BE(commId, 0);
    const msg = new BytableMessage();
    msg.deserialize(
        Buffer.concat([
            Buffer.from([0x02, 0x01, 0x00, 0x08]), // id=0x201, length=8
            body,
        ]),
    );
    return msg;
}

describe('handleGetReadyList', () => {
    it('returns exactly one message', async () => {
        const result = await handleGetReadyList({
            connectionId: 'test:7003',
            message: makeMessage(5),
            log: loggerMock,
        });
        expect(result.messages).toHaveLength(1);
    });

    it('echoes back the connectionId', async () => {
        const result = await handleGetReadyList({
            connectionId: 'test:7003',
            message: makeMessage(5),
            log: loggerMock,
        });
        expect(result.connectionId).toBe('test:7003');
    });

    it('response wire opcode is 0x0210 (NPS_READY_LIST)', async () => {
        const result = await handleGetReadyList({
            connectionId: 'test:7003',
            message: makeMessage(5),
            log: loggerMock,
        });
        const bytes = result.messages[0]!.serialize();
        expect(bytes[0]).toBe(0x02);
        expect(bytes[1]).toBe(0x10);
    });

    it('response body is non-empty', async () => {
        const result = await handleGetReadyList({
            connectionId: 'test:7003',
            message: makeMessage(3),
            log: loggerMock,
        });
        const bytes = result.messages[0]!.serialize();
        expect(bytes.length).toBeGreaterThan(4);
    });
});
