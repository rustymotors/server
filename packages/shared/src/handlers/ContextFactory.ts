/**
 * Context Factory for creating handler contexts with injected services.
 *
 * This module implements the Dependency Inversion Principle by providing
 * a factory that creates contexts with injected services, allowing handlers
 * to depend on abstractions rather than concrete implementations.
 */

import type { ServerLogger } from '../types.js';
import type { ISessionStore, IGameDataStore, IAuthStore } from '../database/interfaces.js';
import type { State } from '../State.js';
import type { HandlerContext, HandlerContextWithServices } from './HandlerTypes.js';
import { databaseProvider } from '../database/DatabaseProvider.js';
import { fetchStateFromDatabase } from '../State.js';
import { getServerLogger } from '../../getServerLogger.js';

/**
 * Services that can be injected into handler contexts.
 */
export interface HandlerServices {
    sessionStore: ISessionStore;
    gameDataStore: IGameDataStore;
    authStore: IAuthStore;
    getEncryptionState: () => State;
}

/**
 * Options for creating a handler context.
 */
export interface ContextFactoryOptions {
    /** Override the default services (for testing) */
    services?: Partial<HandlerServices>;
    /** Override the logger */
    log?: ServerLogger;
}

/**
 * Creates a basic handler context without injected services.
 *
 * @param connectionId - The connection identifier
 * @param port - The port number
 * @param loggerName - Name for the logger (defaults to 'handler')
 * @returns A basic HandlerContext
 *
 * @example
 * ```typescript
 * const context = createHandlerContext('abc123:7003', 7003, 'lobby.handler');
 * ```
 */
export function createHandlerContext(
    connectionId: string,
    port: number,
    loggerName = 'handler'
): HandlerContext {
    return {
        connectionId,
        port,
        log: getServerLogger(loggerName),
    };
}

/**
 * Creates a handler context with injected services.
 *
 * This is the preferred method for production handlers that need
 * database access. Services are resolved from the global databaseProvider.
 *
 * @param connectionId - The connection identifier
 * @param port - The port number
 * @param options - Optional configuration for services and logger
 * @returns A HandlerContextWithServices
 *
 * @example
 * ```typescript
 * // In production:
 * const context = createHandlerContextWithServices('abc123:7003', 7003);
 *
 * // In tests (with mocks):
 * const context = createHandlerContextWithServices('abc123:7003', 7003, {
 *     services: {
 *         sessionStore: mockSessionStore,
 *         gameDataStore: mockGameDataStore,
 *     }
 * });
 * ```
 */
export function createHandlerContextWithServices(
    connectionId: string,
    port: number,
    options: ContextFactoryOptions = {}
): HandlerContextWithServices {
    const defaultServices: HandlerServices = {
        sessionStore: databaseProvider.getSessionStore(),
        gameDataStore: databaseProvider.getGameDataStore(),
        authStore: databaseProvider.getAuthStore(),
        getEncryptionState: fetchStateFromDatabase,
    };

    return {
        connectionId,
        port,
        log: options.log ?? getServerLogger('handler'),
        services: {
            ...defaultServices,
            ...options.services,
        },
    };
}

/**
 * Creates a test context with mock services.
 *
 * This is a convenience function for testing that creates a context
 * with default mock implementations.
 *
 * @param connectionId - The connection identifier
 * @param port - The port number
 * @param overrides - Services to override
 * @returns A HandlerContextWithServices for testing
 */
export function createTestContext(
    connectionId: string,
    port: number,
    overrides: Partial<HandlerServices> = {}
): HandlerContextWithServices {
    // Create mock implementations
    const mockSessionStore: ISessionStore = {
        findUserByConnectionId: async () => undefined,
        getUser: async () => undefined,
        addUser: async () => {},
        updateUser: async () => {},
        deleteUser: async () => {},
        findUserByUsername: async () => undefined,
    };

    const mockGameDataStore: IGameDataStore = {
        getPlayer: async () => undefined,
        updatePlayer: async () => {},
        getOwnedVehiclesForPerson: async () => [],
        getParts: async () => [],
        getBrands: async () => [],
    };

    const mockAuthStore: IAuthStore = {
        isDatabaseConnected: true,
        verifyCredentials: async () => undefined,
        updateSessionKey: async () => {},
        fetchSessionKeyByCustomerId: async () => undefined,
        fetchSessionKeyByConnectionId: async () => undefined,
        getCustomerIdFromConnectionId: async () => undefined,
        updateConnection: async () => {},
    };

    const mockState = {
        sessions: new Map(),
        encryptions: new Map(),
    } as unknown as State;

    const testServices: HandlerServices = {
        sessionStore: mockSessionStore,
        gameDataStore: mockGameDataStore,
        authStore: mockAuthStore,
        getEncryptionState: () => mockState,
        ...overrides,
    };

    return {
        connectionId,
        port,
        log: getServerLogger('test'),
        services: testServices,
    };
}
