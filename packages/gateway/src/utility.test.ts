import { describe, it, expect } from 'vitest';
import { splitPackets } from './utility.js';

const buf = (str: string) => Buffer.from(str);

describe('splitPackets', () => {
    it('returns the entire buffer as a single packet if no separator is found', () => {
        expect(splitPackets(buf('abcdef'), buf('xyz'))).toEqual([buf('abcdef')]);
    });

    it('splits the buffer into packets using the separator', () => {
        expect(splitPackets(buf('abc|def|ghi'), buf('|'))).toEqual([
            buf('abc'),
            buf('def'),
            buf('ghi'),
        ]);
        expect(splitPackets(buf('abc--def--ghi'), buf('--'))).toEqual([
            buf('abc'),
            buf('def'),
            buf('ghi'),
        ]);
        expect(splitPackets(buf('abc|def|ghi|jkl'), buf('|'))).toEqual([
            buf('abc'),
            buf('def'),
            buf('ghi'),
            buf('jkl'),
        ]);
    });

    it('throws an error for invalid separator positions or consecutive separators', () => {
        expect(() => splitPackets(buf('abc|def|'), buf('|'))).toThrow(
            'Separator found at the end of the buffer',
        );
        expect(() => splitPackets(buf('abc||def'), buf('|'))).toThrow(
            'Multiple consecutive separators found',
        );
    });

    it('returns an empty array for empty data', () => {
        expect(splitPackets(buf(''), buf('|'))).toEqual([]);
    });
});
