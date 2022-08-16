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
import type {
    InterServiceTransfer,
    SERVICE_NAMES,
    UserRecordMini,
} from "mcos-types/types.js";
import { handleData } from "./internal.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const log = logger.child({ service: "mcoserver:LoginServer" });

const SELF: { NAME: SERVICE_NAMES } = {
    NAME: "LOGIN",
};

/**
 * Manages the initial game connection setup and teardown.
 * @module LoginServer
 */

/**
 * Please use {@link LoginServer.getInstance()}
 * @classdesc
 */
export class LoginServer {
    /**
     *
     *
     * @static
     * @type {LoginServer}
     * @memberof LoginServer
     */
    static _instance: LoginServer;
    /**
     * Get the single instance of the login server
     *
     * @static
     * @return {LoginServer}
     * @memberof LoginServer
     */
    static getInstance(): LoginServer {
        if (typeof LoginServer._instance === "undefined") {
            LoginServer._instance = new LoginServer();
        }
        return LoginServer._instance;
    }

    /**
     *
     * @private
     * @param {string} contextId
     * @return {UserRecordMini}
     */
    _npsGetCustomerIdByContextId(contextId: string): UserRecordMini {
        log.debug(">>> _npsGetCustomerIdByContextId");
        /** @type {IUserRecordMini[]} */
        const users: UserRecordMini[] = [
            {
                contextId: "5213dee3a6bcdb133373b2d4f3b9962758",
                customerId: 0xac_01_00_00,
                userId: 0x00_00_00_02,
            },
            {
                contextId: "d316cd2dd6bf870893dfbaaf17f965884e",
                customerId: 0x00_54_b4_6c,
                userId: 0x00_00_00_01,
            },
        ];
        if (contextId.toString() === "") {
            throw new Error(`Unknown contextId: ${contextId.toString()}`);
        }

        const userRecord = users.filter((user) => user.contextId === contextId);
        if (typeof userRecord[0] === "undefined" || userRecord.length !== 1) {
            log.debug(
                `preparing to leave _npsGetCustomerIdByContextId after not finding record',
        ${JSON.stringify({
            contextId,
        })}`
            );
            throw new Error(
                `Unable to locate user record matching contextId ${contextId}`
            );
        }

        log.debug(
            `preparing to leave _npsGetCustomerIdByContextId after finding record',
      ${JSON.stringify({
          contextId,
          userRecord,
      })}`
        );
        return userRecord[0];
    }
}

/// ==============
/// ==============

/**
 * Entry and exit point of the Login service
 *
 * @export
 * @param {InterServiceTransfer} requestFromService
 * @return {Promise<InterServiceTransfer>}
 */
export async function receiveLoginData(
    requestFromService: InterServiceTransfer
): Promise<InterServiceTransfer> {
    if (requestFromService.targetService !== SELF.NAME) {
        throw new Error(`This request is not for the ${SELF.NAME} service!`);
    }

    const { connectionId, data } = requestFromService;

    // Get the connection from the database
    const connectionRecord = await prisma.connection.findUnique({
        where: {
            id: connectionId,
        },
    });

    if (connectionRecord === null) {
        throw new Error(
            `Unable to locate connection matching ${connectionId} in the login service`
        );
    }

    try {
        const responseData = await handleData(connectionRecord, data);
        log.trace(`There are ${responseData.length} messages`);
        return {
            targetService: "GATEWAY",
            connectionId,
            data: responseData,
            traceId: requestFromService.traceId,
        };
    } catch (error) {
        throw new Error(
            `There was an error in the login service: ${String(error)}`
        );
    }
}
