/**
 * Unified handler types for Clean Code and SOLID compliance.
 *
 * This module defines the common interfaces for all message handlers
 * across the MCOS server, ensuring consistent signatures and behavior.
 */

import type { ServerLogger } from '../types.js';
import type { BytableBuffer } from '@rustymotors/binary';
import type { ISessionStore, IGameDataStore, IAuthStore } from '../database/interfaces.js';
import type { State } from '../State.js';

/**
 * Context passed to all message handlers.
 * Provides connection information and injected services.
 */
export interface HandlerContext {
    /** Unique identifier for this connection (format: uuid:port) */
    connectionId: string;
    /** The port this handler is serving */
    port: number;
    /** Logger instance for this handler */
    log: ServerLogger;
}

/**
 * Extended context with injected services for handlers that need database access.
 * This follows the Dependency Inversion Principle - handlers depend on abstractions.
 */
export interface HandlerContextWithServices extends HandlerContext {
    services: {
        sessionStore: ISessionStore;
        gameDataStore: IGameDataStore;
        authStore: IAuthStore;
        getEncryptionState: () => State;
    };
}

/**
 * Result returned by message handlers.
 * @template T The type of messages returned (defaults to BytableBuffer)
 */
export interface HandlerResult<T = BytableBuffer> {
    /** The connection ID this result is for */
    connectionId: string;
    /** Array of response messages to send back */
    messages: T[];
}

/**
 * Definition of a message handler with its metadata.
 * Used for registration in the MessageHandlerRegistry.
 * @template TMessage The type of incoming message
 * @template TResult The type of outgoing messages
 */
export interface MessageHandler<TMessage, TResult = BytableBuffer> {
    /** The operation code (message ID) this handler responds to */
    opCode: number;
    /** Human-readable name for logging and debugging */
    name: string;
    /** The handler function */
    handler: (context: HandlerContext, message: TMessage) => Promise<HandlerResult<TResult>>;
}

/**
 * Custom error class for handler failures.
 * Provides structured error information for logging and monitoring.
 */
export class HandlerError extends Error {
    public override readonly name = 'HandlerError';

    constructor(
        message: string,
        /** Error code for categorization (e.g., 'HANDLER_ERROR', 'VALIDATION_ERROR') */
        public readonly code: string,
        /** Connection ID where the error occurred */
        public readonly connectionId: string,
        /** Original error that caused this error */
        public override readonly cause?: Error
    ) {
        super(message);
        // Maintains proper stack trace for where error was thrown (V8 engines)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, HandlerError);
        }
    }

    /**
     * Creates a JSON-serializable representation for logging.
     */
    toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            connectionId: this.connectionId,
            cause: this.cause?.message,
            stack: this.stack,
        };
    }
}

/**
 * Legacy handler signature for backward compatibility during migration.
 * Handlers using this signature should be gradually migrated to MessageHandler.
 * @deprecated Use MessageHandler interface instead
 */
export interface LegacyHandlerArgs {
    connectionId: string;
    message: unknown;
    log?: ServerLogger;
}

/**
 * Legacy result type for backward compatibility.
 * @deprecated Use HandlerResult instead
 */
export interface LegacyHandlerResult<T = BytableBuffer> {
    connectionId: string;
    messages: T[];
}
