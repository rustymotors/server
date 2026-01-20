/**
 * Message Handler Registry for managing opcode-to-handler mappings.
 *
 * This module provides a type-safe registry for message handlers,
 * following the Single Responsibility Principle by separating
 * handler registration from dispatch logic.
 */

import type { HandlerContext, HandlerResult, MessageHandler } from './HandlerTypes.js';

/**
 * Registry for message handlers within a service.
 *
 * This provides a clean way to register and look up handlers by opcode,
 * replacing the array-based pattern with a more efficient Map-based lookup.
 *
 * @example
 * ```typescript
 * const lobbyHandlers = new MessageHandlerRegistry('lobby');
 *
 * lobbyHandlers.register({
 *     opCode: 0x100,
 *     name: 'User login',
 *     handler: handleUserLogin
 * });
 *
 * lobbyHandlers.register({
 *     opCode: 0x106,
 *     name: 'Open comm channel',
 *     handler: handleOpenCommChannel
 * });
 *
 * // In the dispatcher:
 * const handler = lobbyHandlers.getHandler(messageId);
 * if (handler) {
 *     const result = await handler.handler(context, message);
 * }
 * ```
 */
export class MessageHandlerRegistry<TMessage = unknown, TResult = unknown> {
    private readonly handlers = new Map<number, MessageHandler<TMessage, TResult>>();

    /**
     * Creates a new message handler registry.
     *
     * @param serviceName - Name of the service (for logging and error messages)
     */
    constructor(private readonly serviceName: string) {}

    /**
     * Registers a message handler.
     *
     * @param handler - The handler definition to register
     * @returns This registry (for method chaining)
     * @throws {Error} If a handler for this opCode is already registered
     */
    register(handler: MessageHandler<TMessage, TResult>): this {
        if (this.handlers.has(handler.opCode)) {
            const existing = this.handlers.get(handler.opCode);
            throw new Error(
                `Handler for opCode 0x${handler.opCode.toString(16)} already registered ` +
                `in ${this.serviceName} (existing: ${existing?.name}, new: ${handler.name})`
            );
        }
        this.handlers.set(handler.opCode, handler);
        return this;
    }

    /**
     * Gets a handler by opCode.
     *
     * @param opCode - The operation code to look up
     * @returns The handler definition, or undefined if not found
     */
    getHandler(opCode: number): MessageHandler<TMessage, TResult> | undefined {
        return this.handlers.get(opCode);
    }

    /**
     * Checks if a handler is registered for an opCode.
     *
     * @param opCode - The operation code to check
     * @returns True if a handler is registered
     */
    hasHandler(opCode: number): boolean {
        return this.handlers.has(opCode);
    }

    /**
     * Gets all registered handler definitions.
     *
     * @returns Array of handler definitions
     */
    getAllHandlers(): MessageHandler<TMessage, TResult>[] {
        return Array.from(this.handlers.values());
    }

    /**
     * Gets a summary of registered handlers for logging.
     *
     * @returns Array of {opCode, name} for each handler
     */
    listHandlers(): Array<{ opCode: number; name: string }> {
        return Array.from(this.handlers.values()).map(h => ({
            opCode: h.opCode,
            name: h.name
        }));
    }

    /**
     * Gets the count of registered handlers.
     */
    get size(): number {
        return this.handlers.size;
    }

    /**
     * Gets the service name for this registry.
     */
    get name(): string {
        return this.serviceName;
    }

    /**
     * Dispatches a message to the appropriate handler.
     *
     * @param context - The handler context
     * @param opCode - The operation code
     * @param message - The message to dispatch
     * @returns The handler result, or undefined if no handler found
     */
    async dispatch(
        context: HandlerContext,
        opCode: number,
        message: TMessage
    ): Promise<HandlerResult<TResult> | undefined> {
        const handler = this.handlers.get(opCode);
        if (!handler) {
            return undefined;
        }
        return handler.handler(context, message);
    }
}
