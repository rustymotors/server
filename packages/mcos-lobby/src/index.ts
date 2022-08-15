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

import { logger } from "mcos-logger/src/index.js";
import { handleData } from "./internal.js";

import { InterServiceTransfer, SERVICE_NAMES } from "mcos-types/types.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const log = logger.child({ service: "mcoserver:LobbyServer" });

const SELF = {
    NAME: SERVICE_NAMES.LOBBY,
};

/**
 * Entry and exit point for the lobby service
 *
 * @export
 * @param {InterServiceTransfer} requestFromService
 * @return {Promise<InterServiceTransfer>}
 */
export async function receiveLobbyData(
    requestFromService: InterServiceTransfer
): Promise<InterServiceTransfer> {
    log.debug("Entering Lobby server...");

    if (requestFromService.targetService !== SELF.NAME) {
        throw new Error("Attempted to handle a request not for this service");
    }

    const connectionRecord = await prisma.connection.findUnique({
        where: {
            id: requestFromService.connectionId,
        },
    });

    if (connectionRecord === null) {
        throw new Error(
            `Unable to locate connection for id: ${requestFromService.connectionId}`
        );
    }

    try {
        const responseData = await handleData(
            connectionRecord,
            requestFromService.data as Buffer
        );
        log.debug("...Exiting Lobby server");
        return {
            targetService: SERVICE_NAMES.GATEWAY,
            connectionId: requestFromService.connectionId,
            data: responseData,
        };
    } catch (error) {
        throw new Error(
            `There was an error in the lobby service: ${String(error)}`
        );
    }
}
