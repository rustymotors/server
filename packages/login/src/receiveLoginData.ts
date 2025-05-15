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
import { type ServiceResponse } from 'rusty-motors-shared';
import { handleLoginData } from './handleLoginData.js';
import { BufferSerializer, GamePacket } from 'rusty-motors-shared-packets';
import { getServerLogger, ServerLogger } from 'rusty-motors-logger';
import { BytableMessage } from '@rustymotors/binary';

/**
 * Handles incoming login data for a connection and returns a service response with messages converted for legacy serialization compatibility.
 *
 * Awaits processing of the login data, logs entry and exit, and transforms response messages to {@link BufferSerializer} format before returning.
 *
 * @param connectionId - Unique identifier for the connection.
 * @param message - Serialized login data message.
 * @returns A promise resolving to the processed service response with messages in {@link BufferSerializer} format.
 *
 * @throws {Error} If an error occurs during login data processing, including the connection ID in the error message.
 *
 * @remark Response message conversion is a temporary workaround for compatibility with an older serialization format.
 */
export async function receiveLoginData({
    connectionId,
    message,
    log = getServerLogger('receiveLoginData'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<ServiceResponse> {
    try {
        log.debug(`[${connectionId}] Entering login module`);
        const response = await handleLoginData({
            connectionId,
            message,
            log,
        });
        log.debug(
            `[${connectionId}] Exiting login module ${response.messages.length} messages`,
        );

        // @ts-expect-error-next-line - This is a temporary workaround for the old serialization format
        response.messages = GamePacketArrayToBufferSerializerArray(
            response.messages,
        );

        // @ts-expect-error-next-line - This is a temporary workaround for the old serialization format
        return response;
    } catch (error) {
        const err = new Error(
            `[${connectionId}] Error in login service: ${(error as Error).message}`,
            { cause: error },
        );
        throw err;
    }
}

/**
 * Converts an array of {@link GamePacket} objects to an array of {@link BufferSerializer} instances.
 *
 * For each packet, serializes it and deserializes the result into a new {@link BufferSerializer}.
 *
 * @param packets - The game packets to convert.
 * @returns An array of {@link BufferSerializer} instances containing the serialized packet data.
 *
 * @remark This function is a temporary workaround to maintain compatibility with an older serialization format.
 */
function GamePacketArrayToBufferSerializerArray(
    packets: GamePacket[],
): BufferSerializer[] {
    let bufferSerializers: BufferSerializer[] = [];
    for (const packet of packets) {
        const bufferSerializer = new BufferSerializer();
        bufferSerializer.deserialize(packet.serialize());
        bufferSerializers.push(bufferSerializer);
    }
    return bufferSerializers;
}
