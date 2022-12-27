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

import { createCipheriv, createDecipheriv } from "node:crypto";
import createDebug from 'debug'
import { createLogger } from 'bunyan'

const appName = 'mcos'

const debug = createDebug(appName)
const log = createLogger({ name: appName })


/** @type {import("./connections.js").EncryptionSession[]} */
const encryptionSessions = [];

/**
 * @global
 * @typedef {object} SessionRecord
 * @property {string} skey
 * @property {string} sessionkey
 */

/**
 * @param {import("./connections.js").SocketWithConnectionInfo} dataConnection
 * @param {SessionRecord} keys
 * @returns {import("./connections.js").EncryptionSession}
 */
function generateEncryptionPair(
    dataConnection,
    keys
) {
    // For use on Lobby packets
    const { sessionkey, skey } = keys;
    const stringKey = Buffer.from(sessionkey, "hex");
    Buffer.from(stringKey.slice(0, 16));

    // Deepcode ignore HardcodedSecret: This uses an empty IV
    const desIV = Buffer.alloc(8);

    const gsCipher = createCipheriv("des-cbc", Buffer.from(skey, "hex"), desIV);
    gsCipher.setAutoPadding(false);

    const gsDecipher = createDecipheriv(
        "des-cbc",
        Buffer.from(skey, "hex"),
        desIV
    );
    gsDecipher.setAutoPadding(false);

    // For use on messageNode packets

    // File deepcode ignore InsecureCipher: RC4 is the encryption algorithum used here, file deepcode ignore HardcodedSecret: A blank IV is used here
    const tsCipher = createCipheriv("rc4", stringKey.slice(0, 16), "");
    const tsDecipher = createDecipheriv("rc4", stringKey.slice(0, 16), "");

    /** @type {import("./connections.js").EncryptionSession} */
    const newSession = {
        connectionId: dataConnection.id,
        remoteAddress: dataConnection.remoteAddress,
        localPort: dataConnection.localPort,
        sessionKey: keys.sessionkey,
        shortKey: keys.skey,
        gsCipher,
        gsDecipher,
        tsCipher,
        tsDecipher,
    };

    return newSession;
}

/**
 *
 * @param {import("./sockets.js").BufferWithConnection} dataConnection
 * @returns {import("./connections.js").EncryptionSession}
 */
export function selectEncryptors(
    dataConnection
) {
    const { localPort, remoteAddress } = dataConnection.connection;

    if (
        typeof localPort === "undefined" ||
        typeof remoteAddress === "undefined"
    ) {
        const errMessage = `[selectEncryptors]Either localPort or remoteAddress is missing on socket. Can not continue.`;
        log.error(errMessage);
        throw new Error(errMessage);
    }
    const wantedId = `${remoteAddress}:${localPort}`;

    const existingEncryptor = encryptionSessions.find((e) => {
        const thisId = `${e.remoteAddress}:${e.localPort}`;
        debug(`[selectEncryptors] Checking ${thisId} === ${wantedId} ?`);
        return thisId === wantedId;
    });

    if (typeof existingEncryptor !== "undefined") {
        debug(
            `Located existing encryption session for connection id ${dataConnection.connectionId}`
        );
        return existingEncryptor;
    }

    const errMessage = `Unable to select encryptors for connection id ${dataConnection.connectionId}`;
    log.error(errMessage);
    throw new Error(errMessage);
}


/**
 *
 * @param {import("./connections.js").SocketWithConnectionInfo} dataConnection
 * @param {SessionRecord} keys
 * @returns {import("./connections.js").EncryptionSession}
 */
function selectOrCreateEncryptors(
    dataConnection,
    keys
) {
    const { localPort, remoteAddress } = dataConnection;

    if (
        typeof localPort === "undefined" ||
        typeof remoteAddress === "undefined"
    ) {
        const errMessage = `[selectOrCreateEncryptors]Either localPort or remoteAddress is missing on socket. Can not continue.`;
        log.error(errMessage);
        throw new Error(errMessage);
    }
    const wantedId = `${remoteAddress}:${localPort}`;

    const existingEncryptor = encryptionSessions.find((e) => {
        const thisId = `${e.remoteAddress}:${e.localPort}`;
        debug(`[selectEncryptors] Checking ${thisId} === ${wantedId} ?`);
        return thisId === wantedId;
    });

    if (typeof existingEncryptor !== "undefined") {
        debug(
            `Located existing encryption session for connection id ${dataConnection.id}`
        );
        return existingEncryptor;
    }

    const newSession = createEncrypters(dataConnection, keys);

    return newSession;
}

/**
 * 
 * @param {import("./connections.js").SocketWithConnectionInfo} dataConnection 
 * @param {SessionRecord} keys 
 * @returns {import("./connections.js").EncryptionSession}
 */
export function createEncrypters(dataConnection, keys) {
    const newSession = generateEncryptionPair(dataConnection, keys);

    debug(
        `Generated new encryption session for connection id ${dataConnection.id}`
    );

    encryptionSessions.push(newSession);
    return newSession;
}

/**
 * Update the internal connection record
 * @param {string} connectionId
 * @param {import("./connections.js").EncryptionSession} updatedSession
 */
export function updateEncryptionSession(
    connectionId,
    updatedSession
) {
    try {
        const index = encryptionSessions.findIndex((e) => {
            return e.connectionId === connectionId;
        });
        encryptionSessions.splice(index, 1);
        encryptionSessions.push(updatedSession);
        debug(`Updated encryption session for id: ${connectionId}`);
    } catch (error) {
        throw new Error(`Error updating connection, ${String(error)}`);
    }
}

/**
 * CipherBufferDES
 * @param {import("./connections.js").EncryptionSession} encryptionSession
 * @param {Buffer} data
 * @return {{session: import("./connections.js").EncryptionSession, data: Buffer}}
 */
export function cipherBufferDES(
    encryptionSession,
    data
) {
    if (typeof encryptionSession.gsCipher !== "undefined") {
        const ciphered = encryptionSession.gsCipher.update(data);
        return {
            session: encryptionSession,
            data: ciphered,
        };
    }

    throw new Error("No DES cipher set on connection");
}

/**
 * Decrypt a command that is encrypted with DES
 * @param {import("./connections.js").EncryptionSession} encryptionSession
 * @param {Buffer} data
 * @return {{session: import("./connections.js").EncryptionSession, data: Buffer}}
 */
export function decipherBufferDES(
    encryptionSession,
    data
) {
    if (typeof encryptionSession.gsDecipher !== "undefined") {
        const deciphered = encryptionSession.gsDecipher.update(data);
        return {
            session: encryptionSession,
            data: deciphered,
        };
    }

    throw new Error("No DES decipher set on connection");
}

/**
 * Decrypt the buffer contents
 * @param {import("./sockets.js").BufferWithConnection} dataConnection
 * @param {Buffer} buffer
 * @returns {{session: import("./connections.js").EncryptionSession, data: Buffer}}
 */
export function decryptBuffer(
    dataConnection,
    buffer
) {
    const encryptionSession = selectEncryptors(dataConnection);
    const deciphered = encryptionSession.tsDecipher.update(buffer);
    return {
        session: encryptionSession,
        data: deciphered,
    };
}
