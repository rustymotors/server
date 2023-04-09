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

import { handleData } from "./internal.js";

/**
 * Manages the initial game connection setup and teardown.
 * @module LoginServer
 */

/**
 * @global
 * @typedef {object} UserRecordMini
 * @property {string} contextId
 * @property {number} customerId
 * @property {number} userId
 */

/**
 * Please use {@link LoginServer.getInstance()}
 * @classdesc
 * @property {DatabaseManager} databaseManager
 */
export class LoginServer {
    /**
     *
     *
     * @static
     * @type {LoginServer}
     * @memberof LoginServer
     */
    static _instance;

    #databaseManager;

    /** @type {import("mcos/shared").TServerLogger} */
    #log;

    /**
     * Please use getInstance() instead
     * @author Drazi Crendraven
     * @param {import("mcos/shared").TDatabaseManager} database
     * @param {import("mcos/shared").TServerLogger} log
     * @memberof LoginServer
     */
    constructor(database, log) {
        this.#databaseManager = database;
        this.#log = log;
    }

    /**
     * Get the single instance of the login server
     *
     * @static
     * @param {import("mcos/shared").TDatabaseManager} database
     * @param {import("mcos/shared").TServerLogger} log
     * @return {LoginServer}
     * @memberof LoginServer
     */
    static getInstance(database, log) {
        if (typeof LoginServer._instance === "undefined") {
            LoginServer._instance = new LoginServer(database, log);
        }
        return LoginServer._instance;
    }

    /**
     *
     * @private
     * @param {string} contextId
     * @return {UserRecordMini}
     */
    _npsGetCustomerIdByContextId(contextId) {
        this.#log("debug", ">>> _npsGetCustomerIdByContextId");
        /** @type {UserRecordMini[]} */
        const users = [
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
            this.#log(
                "debug",
                `preparing to leave _npsGetCustomerIdByContextId after not finding record',
        ${JSON.stringify({
            contextId,
        })}`
            );
            throw new Error(
                `Unable to locate user record matching contextId ${contextId}`
            );
        }

        this.#log(
            "debug",
            `preparing to leave _npsGetCustomerIdByContextId after finding record',
      ${JSON.stringify({
          contextId,
          userRecord,
      })}`
        );
        return userRecord[0];
    }
}

/**
 * Entry and exit point of the Login service
 *
 * @export
 * @param {import("mcos/shared").TBufferWithConnection} dataConnection
 * @param {import("mcos/shared").TServerLogger} log
 * @return {Promise<import("mcos/shared").TServiceResponse>}
 */
export async function receiveLoginData(dataConnection, log) {
    try {
        log("debug", "Entering login module");
        const response = await handleData(dataConnection, log);
        log("debug", `There are ${response.messages.length} messages`);
        log("debug", "Exiting login module");
        return response;
    } catch (error) {
        throw new Error(
            `There was an error in the login service: ${String(error)}`
        );
    }
}
