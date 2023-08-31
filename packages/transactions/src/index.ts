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

import { ServiceArgs, ServiceResponse } from "../../interfaces/index.js";
import { handleData } from "./internal.js";

/**
 * Entry and exit point for the lobby service
 *
 * @export
 * @param {TBufferWithConnection} dataConnection
 * @param {TServerConfiguration} config
 * @param {TServerLogger} log
 * @return {Promise<TServiceResponse>}
 */
export async function receiveTransactionsData(
    args: ServiceArgs
): Promise<ServiceResponse> {
    const { legacyConnection: dataConnection, config, log, connection } = args;
    log("debug", "Entering receiveTransactionsData");
    try {
        return await handleData({
            legacyConnection: dataConnection,
            connection,
            config,
            log,
        });
    } catch (error) {
        const err = new Error(
            `There was an error in the transaction service: ${String(error)}`
        );
        throw err;
    }
}
