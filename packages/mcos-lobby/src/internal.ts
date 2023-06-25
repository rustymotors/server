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

import { _npsRequestGameConnectServer } from "./handlers/requestConnectGameServer.js";
import { _npsHeartbeat } from "./handlers/heartbeat.js";
import { handleEncryptedNPSCommand } from "./handlers/encryptedCommand.js";
import { Sentry } from "mcos/shared";
import {
    TBufferWithConnection,
    TServerLogger,
    TMessageArrayWithConnection,
} from "mcos/shared/interfaces";

/**
 * @param {TBufferWithConnection} dataConnection
 * @param {TServerLogger} log
 * @return {Promise<TMessageArrayWithConnection>}
 */
export async function handleData(
    dataConnection: TBufferWithConnection,
    log: TServerLogger
): Promise<TMessageArrayWithConnection> {
    const { localPort, remoteAddress } = dataConnection.connection.socket;
    log(
        "debug",
        `Received Lobby packet: ${JSON.stringify({ localPort, remoteAddress })}`
    );
    const { data } = dataConnection;
    const requestCode = data.readUInt16BE(0).toString(16);

    switch (requestCode) {
        // _npsRequestGameConnectServer
        case "100": {
            const result = await _npsRequestGameConnectServer(
                dataConnection,
                log
            );
            return result;
        }

        // NpsHeartbeat

        case "217": {
            const result = await _npsHeartbeat(dataConnection, log);
            return result;
        }

        // NpsSendCommand

        case "1101": {
            // This is an encrypted command

            const result = handleEncryptedNPSCommand(dataConnection, log);
            return result;
        }

        default: {
            const err = new Error(
                `Unknown code ${requestCode} was received on port 7003`
            );
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            log("warning", err.message);
            return {
                connection: dataConnection.connection,
                messages: [],
                log,
            };
        }
    }
}
