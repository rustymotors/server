import { describe, it, expect, vi } from 'vitest';
import { IncomingMessage, ServerResponse } from 'node:http';
import { processHttpRequest, initializeRouteHandlers } from './web.js';
import { databaseService } from 'rusty-motors-database';
import { before } from 'node:test';

describe('processHttpRequest', () => {
    before(() => {
        initializeRouteHandlers();
    });

    it("should respond with 'Hello, world!' for the root path", async () => {
        const request = {
            url: '/',
        } as IncomingMessage;

        const response = {
            setHeader: vi.fn(),
            end: vi.fn(),
        } as unknown as ServerResponse;

        await processHttpRequest(request, response);

        expect(response.setHeader).toHaveBeenCalledWith(
            'Content-Type',
            'text/plain',
        );
        expect(response.end).toHaveBeenCalledWith('Hello, world!');
    });

    it('should respond with 404 for unknown paths', async () => {
        const request = {
            url: '/unknown',
        } as IncomingMessage;

        const response = {
            setHeader: vi.fn(),
            end: vi.fn(),
            statusCode: 0,
        } as unknown as ServerResponse;

        await processHttpRequest(request, response);

        expect(response.statusCode).toBe(404);
        expect(response.end).toHaveBeenCalledWith('Not found');
    });

    it('should handle /AuthLogin path', async () => {
        // Mock the databaseService methods for this test
        const mockUser = { username: 'new', ticket: 'ticket123', customerId: '1' };
        const originalRetrieveUserAccountAsync = databaseService.retrieveUserAccountAsync;
        const originalGenerateTicketAsync = databaseService.generateTicketAsync;
        databaseService.retrieveUserAccountAsync = vi.fn().mockResolvedValue(mockUser);
        databaseService.generateTicketAsync = vi.fn().mockResolvedValue('ticket123');

        const request = {
            url: '/AuthLogin?username=new&password=new',
        } as IncomingMessage;

        const response = {
            setHeader: vi.fn(),
            end: vi.fn(),
        } as unknown as ServerResponse;

        await processHttpRequest(request, response);

        expect(response.setHeader).toHaveBeenCalledWith(
            'Content-Type',
            'text/plain',
        );
        expect(response.end).toHaveBeenCalledWith(
            expect.stringContaining('Valid=TRUE'),
        );

        // Restore original methods
        databaseService.retrieveUserAccountAsync = originalRetrieveUserAccountAsync;
        databaseService.generateTicketAsync = originalGenerateTicketAsync;
    });

    it('should handle /ShardList/ path', async () => {
        const request = {
            url: '/ShardList/',
        } as IncomingMessage;

        const response = {
            setHeader: vi.fn(),
            end: vi.fn(),
        } as unknown as ServerResponse;

        const originalEnv = process.env;
        const testEnv = {
            EXTERNAL_HOST: 'localhost',
            CERTIFICATE_FILE: 'cert.pem',
            PRIVATE_KEY_FILE: 'key.pem',
            PUBLIC_KEY_FILE: 'public.pem',
            LOG_LEVEL: 'info',
        };

        process.env = {
            ...originalEnv,
            ...testEnv,
        };

        await processHttpRequest(request, response);

        expect(response.setHeader).toHaveBeenCalledWith(
            'Content-Type',
            'text/plain',
        );
        expect(response.end).toHaveBeenCalledWith(expect.any(String));
    });
});
