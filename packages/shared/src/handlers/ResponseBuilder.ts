/**
 * Response Builder for constructing handler responses.
 *
 * This module provides a fluent builder pattern for creating handler responses,
 * reducing code duplication across handlers and ensuring consistent response structure.
 */

import type { HandlerResult } from './HandlerTypes.js';

/**
 * Interface for serializable messages.
 */
export interface SerializableMessage {
    serialize(): Buffer;
}

/**
 * Builder for constructing handler responses.
 *
 * Provides a fluent API for adding messages and building the final result.
 *
 * @example
 * ```typescript
 * // Simple usage
 * const result = new ResponseBuilder('abc123:7003')
 *     .addMessage(responsePacket)
 *     .build();
 *
 * // Adding multiple messages
 * const result = new ResponseBuilder('abc123:7003')
 *     .addMessage(ackPacket)
 *     .addMessage(dataPacket)
 *     .addMessage(confirmPacket)
 *     .build();
 *
 * // Conditional adding
 * const builder = new ResponseBuilder('abc123:7003')
 *     .addMessage(baseResponse);
 *
 * if (includeExtras) {
 *     builder.addMessage(extraData);
 * }
 *
 * const result = builder.build();
 *
 * // Empty response
 * const emptyResult = ResponseBuilder.empty('abc123:7003');
 * ```
 */
export class ResponseBuilder<T extends SerializableMessage = SerializableMessage> {
    private readonly messages: T[] = [];

    /**
     * Creates a new ResponseBuilder.
     *
     * @param connectionId - The connection identifier
     */
    constructor(private readonly connectionId: string) {}

    /**
     * Adds a message to the response.
     *
     * @param message - The message to add
     * @returns This builder for chaining
     */
    addMessage(message: T): this {
        this.messages.push(message);
        return this;
    }

    /**
     * Adds multiple messages to the response.
     *
     * @param messages - The messages to add
     * @returns This builder for chaining
     */
    addMessages(messages: T[]): this {
        this.messages.push(...messages);
        return this;
    }

    /**
     * Conditionally adds a message to the response.
     *
     * @param condition - Whether to add the message
     * @param message - The message to add
     * @returns This builder for chaining
     */
    addMessageIf(condition: boolean, message: T): this {
        if (condition) {
            this.messages.push(message);
        }
        return this;
    }

    /**
     * Conditionally adds a message using a factory function.
     *
     * This is useful when the message construction is expensive
     * and should only happen when the condition is true.
     *
     * @param condition - Whether to add the message
     * @param messageFactory - Function that creates the message
     * @returns This builder for chaining
     */
    addMessageIfLazy(condition: boolean, messageFactory: () => T): this {
        if (condition) {
            this.messages.push(messageFactory());
        }
        return this;
    }

    /**
     * Gets the current message count.
     */
    get messageCount(): number {
        return this.messages.length;
    }

    /**
     * Checks if the builder has any messages.
     */
    get hasMessages(): boolean {
        return this.messages.length > 0;
    }

    /**
     * Builds the final handler result.
     *
     * @returns The HandlerResult containing all added messages
     */
    build(): HandlerResult<T> {
        return {
            connectionId: this.connectionId,
            messages: [...this.messages],
        };
    }

    /**
     * Creates an empty response for the given connection.
     *
     * @param connectionId - The connection identifier
     * @returns An empty HandlerResult
     */
    static empty<T extends SerializableMessage>(connectionId: string): HandlerResult<T> {
        return {
            connectionId,
            messages: [],
        };
    }

    /**
     * Creates a response with a single message.
     *
     * @param connectionId - The connection identifier
     * @param message - The message to include
     * @returns A HandlerResult with the single message
     */
    static single<T extends SerializableMessage>(
        connectionId: string,
        message: T
    ): HandlerResult<T> {
        return {
            connectionId,
            messages: [message],
        };
    }

    /**
     * Creates a response from an array of messages.
     *
     * @param connectionId - The connection identifier
     * @param messages - The messages to include
     * @returns A HandlerResult with the messages
     */
    static fromArray<T extends SerializableMessage>(
        connectionId: string,
        messages: T[]
    ): HandlerResult<T> {
        return {
            connectionId,
            messages: [...messages],
        };
    }
}
