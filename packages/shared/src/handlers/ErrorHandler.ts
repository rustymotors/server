/**
 * Error handling utilities for message handlers.
 *
 * Provides consistent error wrapping, logging, and Sentry integration
 * for all handlers across the MCOS server.
 */

import * as Sentry from '@sentry/node';
import type { HandlerContext, HandlerResult } from './HandlerTypes.js';
import { HandlerError } from './HandlerTypes.js';

/**
 * Wraps an error with handler context information and reports to Sentry.
 *
 * @param connectionId - The connection where the error occurred
 * @param handlerName - Name of the handler that failed
 * @param error - The original error
 * @returns A structured HandlerError with full context
 *
 * @example
 * ```typescript
 * try {
 *     // handler logic
 * } catch (error) {
 *     throw wrapHandlerError(connectionId, 'handleOpenCommChannel', error);
 * }
 * ```
 */
export function wrapHandlerError(
    connectionId: string,
    handlerName: string,
    error: unknown
): HandlerError {
    const message = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error ? error : undefined;

    const handlerError = new HandlerError(
        `[${connectionId}] Error in ${handlerName}: ${message}`,
        'HANDLER_ERROR',
        connectionId,
        cause
    );

    // Report to Sentry with context
    Sentry.withScope((scope) => {
        scope.setTag('handler', handlerName);
        scope.setTag('connectionId', connectionId);
        scope.setContext('handler_context', {
            handlerName,
            connectionId,
            originalMessage: message,
        });
        Sentry.captureException(handlerError);
    });

    return handlerError;
}

/**
 * Higher-order function that wraps a handler with error boundary.
 * Catches any errors, logs them, and re-throws as HandlerError.
 *
 * This implements the Decorator pattern for cross-cutting error handling.
 *
 * @param handlerName - Name of the handler (for logging)
 * @param handler - The handler function to wrap
 * @returns A wrapped handler with error handling
 *
 * @example
 * ```typescript
 * const safeHandler = withErrorBoundary(
 *     'handleOpenCommChannel',
 *     async (ctx, msg) => {
 *         // handler implementation
 *         return { connectionId: ctx.connectionId, messages: [] };
 *     }
 * );
 * ```
 */
export function withErrorBoundary<TMsg, TResult>(
    handlerName: string,
    handler: (ctx: HandlerContext, msg: TMsg) => Promise<HandlerResult<TResult>>
): (ctx: HandlerContext, msg: TMsg) => Promise<HandlerResult<TResult>> {
    return async (ctx: HandlerContext, msg: TMsg): Promise<HandlerResult<TResult>> => {
        try {
            return await handler(ctx, msg);
        } catch (error) {
            ctx.log.error(`Handler ${handlerName} failed`, {
                connectionId: ctx.connectionId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw wrapHandlerError(ctx.connectionId, handlerName, error);
        }
    };
}

/**
 * Creates a validation error for invalid message content.
 *
 * @param connectionId - The connection ID
 * @param fieldName - The field that failed validation
 * @param reason - Why validation failed
 * @returns A HandlerError with VALIDATION_ERROR code
 */
export function createValidationError(
    connectionId: string,
    fieldName: string,
    reason: string
): HandlerError {
    return new HandlerError(
        `[${connectionId}] Validation failed for ${fieldName}: ${reason}`,
        'VALIDATION_ERROR',
        connectionId
    );
}

/**
 * Creates an error for unsupported message codes.
 *
 * @param connectionId - The connection ID
 * @param messageCode - The unsupported message code
 * @returns A HandlerError with UNSUPPORTED_MESSAGE code
 */
export function createUnsupportedMessageError(
    connectionId: string,
    messageCode: number
): HandlerError {
    return new HandlerError(
        `[${connectionId}] Unsupported message code: 0x${messageCode.toString(16)}`,
        'UNSUPPORTED_MESSAGE',
        connectionId
    );
}

/**
 * Creates an error for missing encryption session.
 *
 * @param connectionId - The connection ID
 * @returns A HandlerError with NO_ENCRYPTION code
 */
export function createNoEncryptionError(connectionId: string): HandlerError {
    return new HandlerError(
        `[${connectionId}] No encryption session found`,
        'NO_ENCRYPTION',
        connectionId
    );
}

/**
 * Creates an error for missing user session.
 *
 * @param connectionId - The connection ID
 * @returns A HandlerError with NO_SESSION code
 */
export function createNoSessionError(connectionId: string): HandlerError {
    return new HandlerError(
        `[${connectionId}] No user session found`,
        'NO_SESSION',
        connectionId
    );
}
