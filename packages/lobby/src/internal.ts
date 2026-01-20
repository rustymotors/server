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

import { getServerLogger, getSocketQueue, type ServerLogger } from 'rusty-motors-shared';
import type { BytableMessage, BytableBuffer } from '@rustymotors/binary';
import * as Sentry from '@sentry/node';
import { getLobbyHandlerRegistry } from './handlers/registry.js';

/**
 * @param {object} args
 * @param {string} args.connectionId
 * @param {BytableBuffer} args.message
 * @param {ServerLogger} [args.log=getServerLogger({ name: "PersonaServer" })]
 * @returns {Promise<{
 *  connectionId: string,
 * messages: BytableBuffer[],
 * }>}
 * @throws {Error} Unknown code was received
 */
export async function receiveLobbyData({
    connectionId,
    message,
    log = getServerLogger('lobby.receiveLobbyData'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: BytableBuffer[];
}> {
    const data = message.serialize();
    log.debug('Received Lobby packet', {
        connectionId,
        data: data.toString('hex'),
    });

    // Use the handler registry to find the appropriate handler
    const registry = getLobbyHandlerRegistry();
    const handlerEntry = registry.getHandler(message.header.id);

    if (!handlerEntry) {
        // We do not yet support this message code
        log.error(
            `UNSUPPORTED_MESSAGECODE: ${message.header.id.toString(16)}`,
        );
        return {
            connectionId,
            messages: [],
        };
    }

    try {
        const result = await handlerEntry.handler({
            connectionId,
            message,
        });
        log.debug('Leaving receiveLobbyData');
        const sendQueue = getSocketQueue(connectionId, 'send');

        result.messages.forEach((response) =>
            sendQueue.put({
                sequenceNo: -1,
                data: response.serialize(),
            }),
        );
        return {
            connectionId,
            messages: [],
        };
    } catch (error) {
        log.error(`Error handling lobby data: ${(error as Error).message}`);
        const err = Error(`Error handling lobby data: ${String(error)}`);
        err.cause = error;
        Sentry.captureException(err);
        throw err;
    }
}
