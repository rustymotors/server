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

import {
    GameMessage,
    Logger,
    ServiceResponse,
    ServiceArgs,
} from "@mcos/interfaces";
import { handleData } from "./internal.js";
import { NPSMessage, Sentry } from "@mcos/shared";

/**
 * Selects a game persona and marks it as in use
 * @param {NPSMessage} requestPacket
 * @param {TServerLogger} log
 * @returns {Promise<NPSMessage>}
 */
export async function handleSelectGamePersona(
    requestPacket: GameMessage,
    log: Logger
): Promise<GameMessage> {
    log("debug", "_npsSelectGamePersona...");
    log(
        "debug",
        `NPSMsg request object from _npsSelectGamePersona: ${JSON.stringify({
            NPSMsg: requestPacket.toJSON(),
        })}`
    );

    requestPacket.dumpPacket();

    // Create the packet content
    const packetContent = Buffer.alloc(251);

    // Build the packet
    // Response Code
    // 207 = success
    const responsePacket = new NPSMessage("sent");
    responsePacket.msgNo = 0x2_07;
    responsePacket.setContent(packetContent);
    log(
        "debug",
        `NPSMsg response object from _npsSelectGamePersona',
    ${JSON.stringify({
        NPSMsg: responsePacket.toJSON(),
    })}`
    );

    responsePacket.dumpPacket();

    log(
        "debug",
        `[npsSelectGamePersona] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
    );
    return responsePacket;
}

/**
 * Entry and exit point for the persona service
 *
 */
export async function receivePersonaData(
    args: ServiceArgs
): Promise<ServiceResponse> {
    try {
        const { legacyConnection, connection, config, log } = args;
        return await handleData({ legacyConnection, connection, config, log });
    } catch (error) {
        Sentry.captureException(error);
        const err = new Error(
            `There was an error in the persona service: ${String(error)}`
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }
}
