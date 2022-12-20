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

import { DatabaseManager } from "../../mcos-database/src/index.js";
import { handleData } from "./internal.js";
import createLogger from 'pino'
import type { Cipher, Decipher } from "node:crypto";
import type { Socket } from "node:net";
import type { NPSMessage } from "./NPSMessage.js";
const logger = createLogger()

const log = logger.child({ service: "mcoserver:LoginServer" });

/**
 * Manages the initial game connection setup and teardown.
 * @module LoginServer
 */

export declare type UserRecordMini = {
    contextId: string;
    customerId: number;
    userId: number;
};

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
    static _instance: LoginServer;
    databaseManager = DatabaseManager.getInstance();
    /**
     * Get the single instance of the login server
     *
     * @static
     * @return {LoginServer}
     * @memberof LoginServer
     */
    static getInstance(): LoginServer {
        if (typeof LoginServer._instance === "undefined") {
            LoginServer._instance = new LoginServer();
        }
        return LoginServer._instance;
    }

    

    /**
     *
     * @private
     * @param {string} contextId
     * @return {UserRecordMini}
     */
    _npsGetCustomerIdByContextId(contextId: string): UserRecordMini {
        log.debug(">>> _npsGetCustomerIdByContextId");
        /** @type {IUserRecordMini[]} */
        const users: UserRecordMini[] = [
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
            log.debug(
                `preparing to leave _npsGetCustomerIdByContextId after not finding record',
        ${JSON.stringify({
            contextId,
        })}`
            );
            throw new Error(
                `Unable to locate user record matching contextId ${contextId}`
            );
        }

        log.debug(
            `preparing to leave _npsGetCustomerIdByContextId after finding record',
      ${JSON.stringify({
          contextId,
          userRecord,
      })}`
        );
        return userRecord[0];
    }
}

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

export interface GServiceResponse {
    err: Error | null;
    response?: GSMessageArrayWithConnection | undefined;
}


/**
 * Entry and exit point of the Login service
 *
 * @export
 * @param {IBufferWithConnection} dataConnection
 * @return {Promise<IGServiceResponse>}
 */
export async function receiveLoginData(
    dataConnection: BufferWithConnection
): Promise<GServiceResponse> {
    try {
        const response = await handleData(dataConnection);
        log.trace(`There are ${response.messages.length} messages`);
        return { err: null, response };
    } catch (error) {
        const errMessage = `There was an error in the login service: ${String(
            error
        )}`;
        return { err: new Error(errMessage), response: undefined };
    }
}
