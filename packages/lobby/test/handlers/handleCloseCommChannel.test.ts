import { describe, expect, it } from 'vitest';
import { handleCloseCommChannel } from '../../src/handlers/handleCloseCommChannel.js';
import { BytableMessage } from '@rustymotors/binary';
import { loggerMock } from 'rusty-motors-shared/test';

function makeMessage(commId: number): BytableMessage {
    const body = Buffer.alloc(4);
    body.writeInt32BE(commId, 0);
    const msg = new BytableMessage();
    msg.deserialize(
        Buffer.concat([
            Buffer.from([0x01, 0x07, 0x00, 0x08]), // id=0x107, length=8
            body,
        ]),
    );
    return msg;
}

describe('handleCloseCommChannel', () => {
    it('returns exactly one message', async () => {
        const result = await handleCloseCommChannel({
            connectionId: 'test:7003',
            message: makeMessage(5),
            log: loggerMock,
        });
        expect(result.messages).toHaveLength(1);
    });

    it('echoes back the connectionId', async () => {
        const result = await handleCloseCommChannel({
            connectionId: 'test:7003',
            message: makeMessage(5),
            log: loggerMock,
        });
        expect(result.connectionId).toBe('test:7003');
    });

    it('response wire opcode is 0x0209 (NPS_CHANNEL_CLOSED)', async () => {
        const result = await handleCloseCommChannel({
            connectionId: 'test:7003',
            message: makeMessage(5),
            log: loggerMock,
        });
        const bytes = result.messages[0]!.serialize();
        expect(bytes[0]).toBe(0x02);
        expect(bytes[1]).toBe(0x09);
    });

    it('response body contains commId and hardcoded port 7003', async () => {
        const result = await handleCloseCommChannel({
            connectionId: 'test:7003',
            message: makeMessage(5),
            log: loggerMock,
        });
        const bytes = result.messages[0]!.serialize();
        // body starts at offset 4: commId(4) + port(4)
        const commId = bytes.readInt32BE(4);
        const port = bytes.readInt32BE(8);
        expect(commId).toBe(5);
        expect(port).toBe(7003);
    });
});
