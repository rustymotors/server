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

import { Sentry } from "mcos/shared";
import { handleData, userRecords } from "./internal.js";

/**
 * @module mcos-login
 */

/**
 * Please use {@link LoginServer.getInstance()}
 * @property {LoginServer} _instance
 * @property {TDatabaseManager} _databaseManager
 * @property {TServerLogger} _log
 */
export class LoginServer {
    /**
     * @type {LoginServer}
     * @memberof LoginServer
     */
    static _instance;

    /**
     * @private
     * @type {TDatabaseManager}
     */
    _databaseManager;

    /** 
     * @private
     * @type {TServerLogger} */
    _log;

    /**
     * Please use getInstance() instead
     * @author Drazi Crendraven
     * @param {TDatabaseManager} database
     * @param {TServerLogger} log
     */
    constructor(database, log) {
        this._databaseManager = database;
        this._log = log;
    }

    /**
     * Get the single instance of the login server
     *
     * @static
     * @param {TDatabaseManager} database
     * @param {TServerLogger} log
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
     * @return {TUserRecordMini}
     */
    _npsGetCustomerIdByContextId(contextId) {
        this._log("debug", ">>> _npsGetCustomerIdByContextId");
        /** @type {TUserRecordMini[]} */
        if (contextId.toString() === "") {
            const err = new Error(`Unknown contextId: ${contextId.toString()}`);
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            throw err;
        }

        const userRecord = userRecords.filter((user) => user.contextId === contextId);
        if (typeof userRecord[0] === "undefined" || userRecord.length !== 1) {
            this._log(
                "debug",
                `preparing to leave _npsGetCustomerIdByContextId after not finding record',
        ${JSON.stringify({
            contextId,
        })}`
            );
            const err = new Error(
                `Unable to locate user record matching contextId ${contextId}`
            );
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            throw err;
        }

        this._log(
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
 * @param {TBufferWithConnection} dataConnection
 * @param {TServerConfiguration} config
 * @param {TServerLogger} log
 * @return {Promise<TServiceResponse>}
 */
export async function receiveLoginData(dataConnection, config, log) {
    try {
        log("debug", "Entering login module");
        const response = await handleData(dataConnection, config, log);
        log("debug", `There are ${response.messages.length} messages`);
        log("debug", "Exiting login module");
        return response;
    } catch (error) {
        const err = new Error(
            `There was an error in the login service: ${String(error)}`
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }
}
