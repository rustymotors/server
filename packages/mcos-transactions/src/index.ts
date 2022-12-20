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
import createLogger from 'pino'
import type { BinaryStructure } from "./BinaryStructure.js";
import type { Cipher, Decipher } from "node:crypto";
import type { Socket } from "node:net";
import type { MessageNode } from "./MessageNode.js";
const logger = createLogger()

const log = logger.child({ service: "mcos:transactions" });

export type TSMessageBase = BinaryStructure;

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

/**
 * N+ messages, ready for sending, with related connection
 */
export type TSMessageArrayWithConnection = {
    connection: SocketWithConnectionInfo;
    messages: MessageNode[] | TSMessageBase[];
};

export type TServiceResponse = {
    err: Error | null;
    response?: TSMessageArrayWithConnection | undefined;
};

export declare type BufferWithConnection = {
    connectionId: string;
    connection: SocketWithConnectionInfo;
    data: Buffer;
    timestamp: number;
};

/**
 * Entry and exit point for the lobby service
 *
 * @export
 * @param {BufferWithConnection} dataConnection
 * @return {Promise<TServiceResponse>}
 */
export async function receiveTransactionsData(
    dataConnection: BufferWithConnection
): Promise<TServiceResponse> {
    log.debug(`Entering receiveTransactionsData`);
    try {
        const result = await handleData(dataConnection);
        log.debug("Exiting the transactions service");
        return { err: null, response: result };
    } catch (error) {
        const errMessage = `There was an error in the lobby service: ${String(
            error
        )}`;
        return { err: new Error(errMessage), response: undefined };
    }
}
