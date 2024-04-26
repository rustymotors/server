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
import type { ServerLogger, ServiceResponse, NPSMessage, TServerLogger, UserRecordMini } from "../../shared";
import { handleLoginData } from "./internal.js";

/**
 * Please use {@link LoginServer.getInstance()}
 */
export class LoginServer {
    _log: TServerLogger
    static _instance: LoginServer | undefined;
    /**
     * Please use {@see LoginServer.getInstance} instead
     * @param {object} options
     * @param {ServerLogger} options.log
     * @memberof LoginServer
     */
    constructor({ log }: { log: ServerLogger }) {
        this._log = log;
        LoginServer._instance = this;
    }

    /**
     * Get the single instance of the login server
     *
     * @static
     * @param {ServerLogger} log
     * @return {LoginServer}
     */
    static getInstance(log: ServerLogger): LoginServer {
        if (typeof LoginServer._instance === "undefined") {
            LoginServer._instance = new LoginServer({
                log,
            });
        }
        return LoginServer._instance;
    }

    _npsGetCustomerIdByContextId(
        contextId: string,
    ): UserRecordMini {
        this._log.debug(">>> _npsGetCustomerIdByContextId");
        const users: UserRecordMini[] = [
            {
                contextId: "5213dee3a6bcdb133373b2d4f3b9962758",
                customerId: 0x0012808b,
                userId: 0x00000002,
            },
            {
                contextId: "d316cd2dd6bf870893dfbaaf17f965884e",
                customerId: 0x0054b46c,
                userId: 0x00000001,
            },
        ];
        if (contextId.toString() === "") {
            const err = new Error(`Unknown contextId: ${contextId.toString()}`);
            throw err;
        }

        const userRecord = users.filter((user) => user.contextId === contextId);
        if (typeof userRecord[0] === "undefined" || userRecord.length !== 1) {
            this._log.debug(
                `preparing to leave _npsGetCustomerIdByContextId after not finding record',
        ${JSON.stringify({
            contextId,
        })}`,
            );
            const err = new Error(
                `Unable to locate user record matching contextId ${contextId}`,
            );
            throw err;
        }

        this._log.debug(
            `preparing to leave _npsGetCustomerIdByContextId after finding record',
      ${JSON.stringify({
          contextId,
          userRecord,
      })}`,
        );
        return userRecord[0];
    }
}

/** @type {LoginServer | undefined} */
LoginServer._instance = undefined;

/**
 * Entry and exit point of the Login service
 *
 * @export
 * @param {object} args
 * @param {string} args.connectionId
 * @param {NPSMessage} args.message
 * @param {ServerLogger} args.log
 *
 * @return {Promise<ServiceResponse>}
 */
export async function receiveLoginData({
    connectionId,
    message,
    log,
}: {
    connectionId: string;
    message: NPSMessage;
    log: TServerLogger;
}): Promise<ServiceResponse> {
    try {
        log.debug("Entering login module");
        const response = await handleLoginData({
            connectionId,
            message,
            log,
        });
        log.debug(`There are ${response.messages.length} messages`);
        log.debug("Exiting login module");
        return response;
    } catch (error) {
        const err = new Error(
            `There was an error in the login service: ${String(error)}`,
        );
        throw err;
    }
}
