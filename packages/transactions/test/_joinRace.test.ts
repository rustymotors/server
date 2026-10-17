import { describe, expect, it } from 'vitest';
import { MessageNode, JoinRaceMessage } from 'rusty-motors-shared';
import { _joinRace } from '../src/_joinRace.js';
import { loggerMock } from 'rusty-motors-shared/test';

function makePacket(): MessageNode {
    // JoinRaceMessage.sizeOf = 12: msgNo(2LE) + raceId(4) + vehicleId(4) + powerClass(1) + pad(1)
    const joinMsg = new JoinRaceMessage();
    const payload = joinMsg.serialize();
    const packet = new MessageNode();
    packet.setDataBuffer(payload);
    return packet;
}

describe('_joinRace', () => {
    it('returns exactly 1 message', async () => {
        const result = await _joinRace({
            connectionId: 'test:43300',
            packet: makePacket(),
            log: loggerMock,
        });
        expect(result.messages).toHaveLength(1);
    });

    it('echoes back connectionId', async () => {
        const result = await _joinRace({
            connectionId: 'test:43300',
            packet: makePacket(),
            log: loggerMock,
        });
        expect(result.connectionId).toBe('test:43300');
    });

    it('response message has payload encryption enabled', async () => {
        const result = await _joinRace({
            connectionId: 'test:43300',
            packet: makePacket(),
            log: loggerMock,
        });
        // MessageNode with setPayloadEncryption(true) → flags bit 0x08
        const msg = result.messages[0]!;
        const bytes = msg.serialize();
        // MessageNode header: length(2LE) + signature(4) + sequence(4LE) + flags(1) at offset 10
        expect(bytes[10]! & 0x08).toBe(0x08);
    });
});
