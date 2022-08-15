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
import { PrismaClient } from "@prisma/client";
import { InterServiceTransfer, SERVICE_NAMES } from "mcos-types";
const prisma = new PrismaClient();

const SELF = {
    NAME: SERVICE_NAMES.TRANSACTION,
};

const log = logger.child({ service: "mcos:transactions" });

/**
 * Entry and exit point for the lobby service
 *
 * @export
 * @param {InterServiceTransfer} requestFromService
 * @return {Promise<InterServiceTransfer>}
 */
export async function receiveTransactionsData(
    requestFromService: InterServiceTransfer
): Promise<InterServiceTransfer> {
    log.debug(`Entering receiveTransactionsData`);
    try {
        if (requestFromService.targetService !== SELF.NAME) {
            throw new Error("Received a request not for this service!");
        }

        const { connectionId } = requestFromService;
        const connectionRecord = await prisma.connection.findUnique({
            where: {
                id: connectionId,
            },
        });

        if (connectionRecord === null) {
            throw new Error(
                `Unable to locate connection match id: ${connectionId}`
            );
        }

        const responseData = await handleData(
            connectionRecord,
            requestFromService.data
        );
        log.debug("Exiting the transactions service");
        return {
            targetService: SERVICE_NAMES.GATEWAY,
            connectionId,
            data: responseData,
        };
    } catch (error) {
        throw new Error(
            `There was an error in the transactions service: ${String(error)}`
        );
    }
}
