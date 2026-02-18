/**
 * Handler utilities module.
 *
 * Exports types and utilities for implementing Clean Code
 * and SOLID-compliant message handlers.
 */
export {
    HandlerError
} from './HandlerTypes.js';
export type {
    HandlerContext,
    HandlerContextWithServices,
    HandlerResult,
    MessageHandler, LegacyHandlerArgs,
    LegacyHandlerResult
} from './HandlerTypes.js';

export {
    wrapHandlerError,
    withErrorBoundary,
    createValidationError,
    createUnsupportedMessageError,
    createNoEncryptionError,
    createNoSessionError,
} from './ErrorHandler.js';

export { MessageHandlerRegistry } from './MessageHandlerRegistry.js';

export {
    createHandlerContext,
    createHandlerContextWithServices,
    createTestContext,
    type HandlerServices,
    type ContextFactoryOptions,
} from './ContextFactory.js';

export {
    ResponseBuilder,
    type SerializableMessage,
} from './ResponseBuilder.js';
