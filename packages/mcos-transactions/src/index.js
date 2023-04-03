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
import log from "../../../log.js";

/**
 * Entry and exit point for the lobby service
 *
 * @export
 * @param {import("../../mcos-gateway/src/sockets.js").BufferWithConnection} dataConnection
 * @return {Promise<import("../../mcos-gateway/src/sockets.js").ServiceResponse>}
 */
export async function receiveTransactionsData(dataConnection) {
    log.info(`Entering receiveTransactionsData`);
    try {
        return await handleData(dataConnection);
    } catch (error) {
        throw new Error(
            `There was an error in the transaction service: ${String(error)}`
        );
    }
}
