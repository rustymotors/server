import { describe, expect, it } from 'vitest';
import { handleGetMiniUserList } from '../../src/handlers/handleGetMiniUserList.js';
import { BytableMessage } from '@rustymotors/binary';
import { loggerMock } from 'rusty-motors-shared/test';

function makeMessage(commId: number): BytableMessage {
    const body = Buffer.alloc(4);
    body.writeUInt32BE(commId, 0);
    const msg = new BytableMessage();
    msg.deserialize(
        Buffer.concat([
            Buffer.from([0x01, 0x28, 0x00, 0x08]), // id=0x128, length=8
            body,
        ]),
    );
    return msg;
}

describe('handleGetMiniUserList', () => {
    it('returns exactly one message', async () => {
        const result = await handleGetMiniUserList({
            connectionId: 'test:7003',
            message: makeMessage(5),
            log: loggerMock,
        });
        expect(result.messages).toHaveLength(1);
    });

    it('echoes back the connectionId', async () => {
        const result = await handleGetMiniUserList({
            connectionId: 'test:7003',
            message: makeMessage(5),
            log: loggerMock,
        });
        expect(result.connectionId).toBe('test:7003');
    });

    it('response wire opcode is 0x0229 (NPS_MINI_USER_LIST)', async () => {
        const result = await handleGetMiniUserList({
            connectionId: 'test:7003',
            message: makeMessage(5),
            log: loggerMock,
        });
        const bytes = result.messages[0]!.serialize();
        expect(bytes[0]).toBe(0x02);
        expect(bytes[1]).toBe(0x29);
    });

    it('response body has hardcoded commId=1 and userCount=2', async () => {
        const result = await handleGetMiniUserList({
            connectionId: 'test:7003',
            message: makeMessage(5),
            log: loggerMock,
        });
        const bytes = result.messages[0]!.serialize();
        // header (4 bytes) + commId (4 bytes BE) + userCount (4 bytes BE)
        expect(bytes.readUInt32BE(4)).toBe(1);
        expect(bytes.readUInt32BE(8)).toBe(2);
    });
});
