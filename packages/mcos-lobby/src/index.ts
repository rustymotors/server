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
import type {
    BufferWithConnection,
    GServiceResponse,
} from "mcos-types/types.js";
import { InterServiceTransfer, SERVICE_NAMES } from "mcos-types/types.js";

const log = logger.child({ service: "mcoserver:LobbyServer" });

const SELF = {
    NAME: SERVICE_NAMES.LOBBY,
};

/**
 * Entry and exit point for the lobby service
 *
 * @export
 * @param {BufferWithConnection} dataConnection
 * @return {Promise<GServiceResponse>}
 */
export async function receiveLobbyData(
    dataConnection: BufferWithConnection
): Promise<GServiceResponse> {
    try {
        return { err: null, response: await handleData(dataConnection) };
    } catch (error) {
        const errMessage = `There was an error in the lobby service: ${String(
            error
        )}`;
        log.error(errMessage);
        return { err: new Error(errMessage), response: undefined };
    }
}
