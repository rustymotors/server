import { describe, it, expect } from 'vitest';
import { splitPackets } from './utility';

describe('splitPackets', () => {
    it('should return the entire buffer as a single packet if no separator is found', () => {
        const data = Buffer.from('abcdef');
        const separator = Buffer.from('xyz');
        const result = splitPackets(data, separator);
        expect(result).toEqual([data]);
    });

    it('should split the buffer into packets using the separator', () => {
        const data = Buffer.from('abc|def|ghi');
        const separator = Buffer.from('|');
        const result = splitPackets(data, separator);
        expect(result).toEqual([
            Buffer.from('abc'),
            Buffer.from('def'),
            Buffer.from('ghi'),
        ]);
    });

    it('should throw an error if the separator is found at the end of the buffer', () => {
        const data = Buffer.from('abc|def|');
        const separator = Buffer.from('|');
        expect(() => splitPackets(data, separator)).toThrow(
            'Separator found at the end of the buffer',
        );
    });

    it('should handle buffers with no data correctly', () => {
        const data = Buffer.from('');
        const separator = Buffer.from('|');
        const result = splitPackets(data, separator);
        expect(result).toEqual([]);
    });

    it('should handle cases where the separator is not at the start or end', () => {
        const data = Buffer.from('abc|def|ghi|jkl');
        const separator = Buffer.from('|');
        const result = splitPackets(data, separator);
        expect(result).toEqual([
            Buffer.from('abc'),
            Buffer.from('def'),
            Buffer.from('ghi'),
            Buffer.from('jkl'),
        ]);
    });

    it('should handle cases where the separator is longer than one character', () => {
        const data = Buffer.from('abc--def--ghi');
        const separator = Buffer.from('--');
        const result = splitPackets(data, separator);
        expect(result).toEqual([
            Buffer.from('abc'),
            Buffer.from('def'),
            Buffer.from('ghi'),
        ]);
    });

    it('should throw an error if multiple consecutive separators are found', () => {
        const data = Buffer.from('abc||def');
        const separator = Buffer.from('|');
        expect(() => splitPackets(data, separator)).toThrow(
            'Multiple consecutive separators found',
        );
    });
});
