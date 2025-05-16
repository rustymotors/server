import { describe, it, expect } from 'vitest';
import { splitPackets } from './utility.js';

const buf = (str: string) => Buffer.from(str);

describe('splitPackets', () => {
    it('should return the entire buffer as a single packet if no separator is found', () => {
        const data = buf('abcdef');
        const separator = buf('xyz');
        const result = splitPackets(data, separator);
        expect(result).toEqual([data]);
    });

    it('should split the buffer into packets using the separator', () => {
        const data = buf('abc|def|ghi');
        const separator = buf('|');
        const result = splitPackets(data, separator);
        expect(result).toEqual([buf('abc'), buf('def'), buf('ghi')]);
    });

    it('should throw an error if the separator is found at the end of the buffer', () => {
        const data = buf('abc|def|');
        const separator = buf('|');
        expect(() => splitPackets(data, separator)).toThrow(
            'Separator found at the end of the buffer',
        );
    });

    it('should handle buffers with no data correctly', () => {
        const data = buf('');
        const separator = buf('|');
        const result = splitPackets(data, separator);
        expect(result).toEqual([]);
    });

    it('should handle cases where the separator is not at the start or end', () => {
        const data = buf('abc|def|ghi|jkl');
        const separator = buf('|');
        const result = splitPackets(data, separator);
        expect(result).toEqual([
            buf('abc'),
            buf('def'),
            buf('ghi'),
            buf('jkl'),
        ]);
    });

    it('should handle cases where the separator is longer than one character', () => {
        const data = buf('abc--def--ghi');
        const separator = buf('--');
        const result = splitPackets(data, separator);
        expect(result).toEqual([buf('abc'), buf('def'), buf('ghi')]);
    });

    it('should throw an error if multiple consecutive separators are found', () => {
        const data = buf('abc||def');
        const separator = buf('|');
        expect(() => splitPackets(data, separator)).toThrow(
            'Multiple consecutive separators found',
        );
    });
});
