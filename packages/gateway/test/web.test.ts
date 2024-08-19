import {
    generateShardList,
    handleGetCert,
    handleGetKey,
    handleGetRegistry,
} from 'rusty-motors-shard';
import { describe, expect, it, vi } from 'vitest';

function mockConfig() {
    return {
        certificateFile: 'test',
        privateKeyFile: 'test',
        publicKeyFile: 'test',
        host: 'test',
    };
}

describe('web', () => {
    it('handleGetCert', async () => {
        vi.mock('node:fs/promises', async (importOriginal) => {
            const originalModule =
                (await importOriginal()) as typeof import('node:fs/promises');
            return {
                ...originalModule,
                readFile: vi.fn().mockResolvedValue('test'),
            };
        });
        const config = mockConfig();
        const result = await handleGetCert(config);
        expect(result).toBe('test');
    });

    it('handleGetRegistry', () => {
        const config = mockConfig();
        const result = handleGetRegistry(config);
        expect(result).toContain('Windows Registry Editor Version 5.00');
        expect(result).toContain('"ShardUrlDev"="http://test/ShardList/"');
    });

    it('handleGetKey', async () => {
        const config = mockConfig();
        const result = await handleGetKey(config);
        expect(result).toBe('test');
    });

    it('generateShardList', () => {
        const config = mockConfig();
        const result = generateShardList(config.host);
        expect(result).toContain('LoginServerIP=test');
    });
});
