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
import { ServerLogger, type ServiceResponse } from 'rusty-motors-shared';
import { handleLoginData } from './handleLoginData.js';
import { BufferSerializer, GamePacket } from 'rusty-motors-shared-packets';
import { getServerLogger } from 'rusty-motors-shared';
import { BytableMessage } from '@rustymotors/binary';

/**
 * Processes incoming login data for a connection and returns the resulting service response.
 *
 * Awaits handling of the login data, logs entry and exit, and converts the response messages to the required serialization format before returning.
 *
 * @param connectionId - Unique identifier for the connection.
 * @param message - Serialized login data message.
 * @param log - Optional logger instance.
 * @returns A promise resolving to the processed service response with messages converted to {@link BufferSerializer} format.
 *
 * @throws {Error} If an error occurs during login data processing, including the connection ID in the error message.
 *
 * @remark The conversion of response messages is a temporary workaround for legacy serialization compatibility.
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

        // @ts-ignore-next-line - This is a temporary workaround for the old serialization format
        response.messages = GamePacketArrayToBufferSerializerArray(
            response.messages,
        );

        // @ts-ignore-next-line - This is a temporary workaround for the old serialization format
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
 * Converts an array of {@link GamePacket} objects into an array of {@link BufferSerializer} instances.
 *
 * Each packet is serialized and then deserialized into a new {@link BufferSerializer}.
 *
 * @param packets - The array of game packets to convert.
 * @returns An array of {@link BufferSerializer} objects representing the serialized packets.
 *
 * @remark This conversion is a temporary workaround for compatibility with an older serialization format.
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
