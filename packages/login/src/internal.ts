// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { login } from './login.js';
import { GamePacket } from 'rusty-motors-shared-packets';
import { BytableMessage } from '@rustymotors/binary';
import { ServerLogger } from 'rusty-motors-logger';

export type LoginMessageHandlerFn = (args: {
    connectionId: string;
    message: BytableMessage;
    log: ServerLogger;
}) => Promise<{
    connectionId: string;
    messages: GamePacket[];
}>;

export type LoginMessageHandlerEntry = {
    opCode: number;
    name: string;
    handler: LoginMessageHandlerFn;
};

/**
 * An array of message handlers for processing different types of messages.
 * Each handler is associated with an operation code (opCode) and a name.
 *
 * @type {LoginMessageHandlerEntry}
 *
 * @property {number} opCode - The operation code that identifies the type of message.
 * @property {string} name - The name of the message handler.
 * @property {function} handler - The function that processes the message. It takes an object with the following properties:
 * @property {string} handler.args.connectionId - The ID of the connection.
 * @property {GamePacket} handler.args.message - The message to be processed.
 * @property {ServerLogger} handler.args.log - The logger for server logging.
 * @returns {Promise<{connectionId: string, messages: GamePacket[]}>} - A promise that resolves to an object containing the connection ID and an array of messages.
 */
const messageHandlers: LoginMessageHandlerEntry[] = [
    {
        opCode: 1281, // 0x0501
        name: 'UserLogin',
        handler: login,
    },
];

/**
 * Fallback handler for login messages with unrecognized operation codes.
 *
 * Logs an error and throws when no handler exists for the message's operation code.
 *
 * @throws {Error} Always thrown to indicate that no handler was found for the message's operation code.
 */
function loginMessageHandlerFallback({
    connectionId,
    message,
    log,
}: {
    connectionId: string;
    message: BytableMessage;
    log: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: GamePacket[];
}> {
    log.error(
        `[${connectionId}] No handler found for message with opCode: ${message.header.messageId}`,
    );
    throw new Error(
        `No handler found for message with opCode: ${message.header.messageId}`,
    );
}

/**
 * Returns the login message handler function for the specified operation code, or a fallback handler that throws if the code is unrecognized.
 *
 * @param opCode - The operation code identifying the login message type.
 * @returns The handler function for the given {@link opCode}, or a fallback that always throws an error for unknown codes.
 */
export function getMessageHandlerOrFallback(
    opCode: number,
): LoginMessageHandlerFn {
    return (
        messageHandlers.find((h) => h.opCode === opCode)?.handler ??
        loginMessageHandlerFallback
    );
}
