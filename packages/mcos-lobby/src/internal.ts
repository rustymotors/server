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
import createLogger from 'pino'
import type { Socket } from "node:net";
import type { Cipher, Decipher } from "node:crypto";
import type { NPSMessage } from "./NPSMessage.js";
const logger = createLogger()

const log = logger.child({ service: "mcos:lobby" });

export declare type EncryptionSession = {
    connectionId: string;
    remoteAddress: string;
    localPort: number;
    sessionKey: string;
    shortKey: string;
    gsCipher: Cipher;
    gsDecipher: Decipher;
    tsCipher: Cipher;
    tsDecipher: Decipher;
};

/**
 * Socket with connection properties
 */
export declare type SocketWithConnectionInfo = {
    socket: Socket;
    seq: number;
    id: string;
    remoteAddress: string;
    localPort: number;
    personaId: number;
    lastMessageTimestamp: number;
    inQueue: boolean;
    useEncryption: boolean;
    encryptionSession?: EncryptionSession;
};

export declare type BufferWithConnection = {
    connectionId: string;
    connection: SocketWithConnectionInfo;
    data: Buffer;
    timestamp: number;
};

export interface GSMessageArrayWithConnection {
    connection: SocketWithConnectionInfo;
    messages: NPSMessage[];
}

/**
 * @param {BufferWithConnection} dataConnection
 * @return {Promise<GSMessageArrayWithConnection>}
 */
export async function handleData(
    dataConnection: BufferWithConnection
): Promise<GSMessageArrayWithConnection> {
    const { localPort, remoteAddress } = dataConnection.connection.socket;
    log.debug(
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
