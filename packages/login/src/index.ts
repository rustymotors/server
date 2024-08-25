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

import { DatabaseManager } from "../../interfaces/index.js";
import { ServerError } from "../../shared/src/ServerError.js";
import { getServerLogger } from "rusty-motors-shared";
import { NPSMessage } from "../../shared/NPSMessage.js";
import { handleLoginData } from "./internal.js";

/**
 * Please use {@link LoginServer.getInstance()}
 */
export class LoginServer {
    _log: any;
    static _instance: LoginServer | undefined;
    /**
     * Please use {@see LoginServer.getInstance} instead
     * @param {object} options
     * @param {import("../../interfaces/index.js").DatabaseManager} options.database
     * @param {import("pino").Logger} [options.log=getServerLogger({ module: "LoginServer" })]
     * @memberof LoginServer
     */
    constructor({
        log = getServerLogger({
            module: "LoginServer",
        }),
    }: {
        database: import("../../interfaces/index.js").DatabaseManager;
        log?: import("pino").Logger;
    }) {
        this._log = log;
        LoginServer._instance = this;
    }

    /**
     * Get the single instance of the login server
     *
     * @static
     * @param {import("../../interfaces/index.js").DatabaseManager} database
     * @param {import("pino").Logger} log
     * @return {LoginServer}
     */
    static getInstance(
        database: import("../../interfaces/index.js").DatabaseManager,
        log: import("pino").Logger,
    ): LoginServer {
        if (typeof LoginServer._instance === "undefined") {
            LoginServer._instance = new LoginServer({
                database,
                log,
            });
        }
        return LoginServer._instance;
    }

    /**
     *
     * @param {string} contextId
     * @return {import("../../interfaces/index.js").UserRecordMini}
     */
    _npsGetCustomerIdByContextId(
        contextId: string,
    ): import("../../interfaces/index.js").UserRecordMini {
        this._log.debug(">>> _npsGetCustomerIdByContextId");
        /** @type {import("../../interfaces/index.js").UserRecordMini[]} */
        const users: import("../../interfaces/index.js").UserRecordMini[] = [
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
            const err = new ServerError(
                `Unknown contextId: ${contextId.toString()}`,
            );
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
            const err = new ServerError(
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
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "LoginServer" })]
 *
 * @return {Promise<import("../../shared/State.js").ServiceResponse>}
 */
export async function receiveLoginData({
    connectionId,
    message,
    log = getServerLogger({
        module: "LoginServer",
    }),
}: {
    connectionId: string;
    message: NPSMessage;
    log?: import("pino").Logger;
}): Promise<import("../../shared/State.js").ServiceResponse> {
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
        const err = new ServerError(
            `There was an error in the login service: ${String(error)}`,
        );
        throw err;
    }
}
