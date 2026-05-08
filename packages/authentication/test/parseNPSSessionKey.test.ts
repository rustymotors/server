import { describe, expect, it } from 'vitest';
import { parseNPSSessionKey } from '../src/login/NPSUserStatus.js';

describe('parseNPSSessionKey', () => {
    it('extracts sessionKeyLength, hex sessionKey, and expires from a valid buffer', () => {
        const keyBytes = Buffer.from([0xde, 0xad, 0xbe, 0xef]);
        const buf = Buffer.alloc(2 + 4 + 4);
        buf.writeUInt16BE(4, 0);
        keyBytes.copy(buf, 2);
        buf.writeInt32BE(100, 6);

        const result = parseNPSSessionKey(buf);
        expect(result.sessionKeyLength).toBe(4);
        expect(result.sessionKey).toBe('deadbeef');
        expect(result.expires).toBe(100);
    });

    it('throws when buffer is too short to read the length prefix', () => {
        expect(() => parseNPSSessionKey(Buffer.alloc(1))).toThrow();
    });

    it('handles a zero-length session key', () => {
        const buf = Buffer.alloc(2 + 0 + 4);
        buf.writeUInt16BE(0, 0);
        buf.writeInt32BE(42, 2);

        const result = parseNPSSessionKey(buf);
        expect(result.sessionKeyLength).toBe(0);
        expect(result.sessionKey).toBe('');
        expect(result.expires).toBe(42);
    });
});
