import { describe, expect, it } from 'vitest';
import { handleLoginData } from '../src/login/handleLoginData.js';
import { BytableMessage } from '@rustymotors/binary';
import { loggerMock } from 'rusty-motors-shared/test';

function makeMessage(opcode: number): BytableMessage {
    // NPSMessage wire format: version 1 = 12-byte header
    // bytes[0..1] = opcode (BE), bytes[2..3] = length, rest = zeros
    const msg = new BytableMessage(1);
    msg.header.setId(opcode);
    return msg;
}

describe('handleLoginData', () => {
    it('throws UNSUPPORTED_MESSAGECODE for an unregistered opcode', async () => {
        await expect(
            handleLoginData({
                connectionId: 'test:8226',
                message: makeMessage(0xffff),
                log: loggerMock,
            }),
        ).rejects.toThrow('UNSUPPORTED_MESSAGECODE');
    });

    it('includes the opcode in the error message', async () => {
        await expect(
            handleLoginData({
                connectionId: 'test:8226',
                message: makeMessage(0xffff),
                log: loggerMock,
            }),
        ).rejects.toThrow('65535');
    });
});
