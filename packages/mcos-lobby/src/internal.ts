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
import { _npsRequestGameConnectServer } from "./handlers/requestConnectGameServer.js";
import { _npsHeartbeat } from "./handlers/heartbeat.js";
import { handleEncryptedNPSCommand } from "./handlers/encryptedCommand.js";
import type { Connection } from "@prisma/client";

const log = logger.child({ service: "mcos:lobby" });

/**
 * @param {Connection} onnection
 * @param {Buffer} data
 * @return {Promise<Buffer>}
 */
export async function handleData(
    connection: Connection,
    data: Buffer
): Promise<Buffer> {
    log.debug(
        `Received Lobby packet: ${JSON.stringify({
            localPort: connection.localPort,
            remoteAddress: connection.remoteAddress,
        })}`
    );
    const requestCode = data.readUInt16BE(0).toString(16);

    switch (requestCode) {
        // _npsRequestGameConnectServer
        case "100": {
            const responsePacket = await _npsRequestGameConnectServer(
                connection,
                data
            );
            return responsePacket.serialize();
        }

        // NpsHeartbeat

        case "217": {
            const responsePacket = await _npsHeartbeat(connection, data);
            return responsePacket.serialize();
        }

        // NpsSendCommand

        case "1101": {
            // This is an encrypted command

            const responsePacket = await handleEncryptedNPSCommand(
                connection,
                data
            );
            return responsePacket.serialize();
        }

        default:
            // No need to throw here
            log.warn(`Unknown code ${requestCode} was received on port 7003`);
            return Buffer.alloc(0);
    }
}
