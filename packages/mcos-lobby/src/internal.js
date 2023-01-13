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
import log from '../../../log.js'

/**
 * @param {import("../../mcos-gateway/src/sockets.js").BufferWithConnection} dataConnection
 * @return {Promise<import("../../mcos-gateway/src/sockets.js").MessageArrayWithConnection>}
 */
export async function handleData(
    dataConnection
) {
    const { localPort, remoteAddress } = dataConnection.connection.socket;
    log.info(
        `Received Lobby packet: ${JSON.stringify({ localPort, remoteAddress })}`
    );
    const { data } = dataConnection;
    const requestCode = data.readUInt16BE(0).toString(16);

    switch (requestCode) {
        // _npsRequestGameConnectServer
        case "100": {
            const result = await _npsRequestGameConnectServer(dataConnection);
            return result;
        }

        // NpsHeartbeat

        case "217": {
            const result = await _npsHeartbeat(dataConnection);
            return result;
        }

        // NpsSendCommand

        case "1101": {
            // This is an encrypted command

            const result = handleEncryptedNPSCommand(dataConnection);
            return result;
        }

        default:
            throw new Error(
                `Unknown code ${requestCode} was received on port 7003`
            );
    }
}
