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

/** @type {import("mcos/shared").TEncryptionSession[]} */
const encryptionSessions = [];

/**
 * @global
 * @typedef {object} SessionRecord
 * @property {string} skey
 * @property {string} sessionkey
 */

/**
 * @param {import("mcos/shared").TSocketWithConnectionInfo} dataConnection
 * @param {import("mcos/shared").TSessionRecord} keys
 * @returns {import("mcos/shared").TEncryptionSession}
 */
function generateEncryptionPair(dataConnection, keys) {
    // For use on Lobby packets
    const { sessionKey, sKey } = keys;
    const stringKey = Buffer.from(sessionKey, "hex");
    Buffer.from(stringKey.slice(0, 16));

    // Deepcode ignore HardcodedSecret: This uses an empty IV
    const desIV = Buffer.alloc(8);

    const gsCipher = createCipheriv("des-cbc", Buffer.from(sKey, "hex"), desIV);
    gsCipher.setAutoPadding(false);

    const gsDecipher = createDecipheriv(
        "des-cbc",
        Buffer.from(sKey, "hex"),
        desIV
    );
    gsDecipher.setAutoPadding(false);

    // For use on messageNode packets

    // File deepcode ignore InsecureCipher: RC4 is the encryption algorithum used here, file deepcode ignore HardcodedSecret: A blank IV is used here
    const tsCipher = createCipheriv("rc4", stringKey.subarray(0, 16), "");
    const tsDecipher = createDecipheriv("rc4", stringKey.subarray(0, 16), "");

    /** @type {import("mcos/shared").TEncryptionSession} */
    const newSession = {
        connectionId: dataConnection.id,
        remoteAddress: dataConnection.remoteAddress,
        localPort: dataConnection.localPort,
        sessionKey: keys.sessionKey,
        sKey: keys.sKey,
        gsCipher,
        gsDecipher,
        tsCipher,
        tsDecipher,
    };

    return newSession;
}

/**
 *
 * @param {import("mcos/shared").TBufferWithConnection} dataConnection
 * @param {import("mcos/shared").TServerLogger} log
 * @returns {import("mcos/shared").TEncryptionSession}
 */
export function selectEncryptors(dataConnection, log) {
    const { localPort, remoteAddress } = dataConnection.connection;

    if (
        typeof localPort === "undefined" ||
        typeof remoteAddress === "undefined"
    ) {
        const err = new Error(
            `[selectEncryptors]Either localPort or remoteAddress is missing on socket. Can not continue.`
        );
        throw err;
    }
    const wantedId = `${remoteAddress}:${localPort}`;

    const existingEncryptor = encryptionSessions.find((e) => {
        const thisId = `${e.remoteAddress}:${e.localPort}`;
        log.info(`[selectEncryptors] Checking ${thisId} === ${wantedId} ?`);
        return thisId === wantedId;
    });

    if (typeof existingEncryptor !== "undefined") {
        log.info(
            `Located existing encryption session for connection id ${dataConnection.connectionId}`
        );
        return existingEncryptor;
    }

    const err = new Error(
        `Unable to select encryptors for connection id ${dataConnection.connectionId}`
    );
    throw err;
}

/**
 *
 * @param {import("mcos/shared").TSocketWithConnectionInfo} dataConnection
 * @param {import("mcos/shared").TSessionRecord} keys
 * @param {import("mcos/shared").TServerLogger} log
 * @returns {import("mcos/shared").TEncryptionSession}
 */
export function createEncrypters(dataConnection, keys, log) {
    const newSession = generateEncryptionPair(dataConnection, keys);

    log.info(
        `Generated new encryption session for connection id ${dataConnection.id}`
    );

    encryptionSessions.push(newSession);
    return newSession;
}

/**
 * Update the internal connection record
 * @param {string} connectionId
 * @param {import("mcos/shared").TEncryptionSession} updatedSession
 * @param {import("mcos/shared").TServerLogger} log
 */
export function updateEncryptionSession(connectionId, updatedSession, log) {
    try {
        const index = encryptionSessions.findIndex((e) => {
            return e.connectionId === connectionId;
        });
        encryptionSessions.splice(index, 1);
        encryptionSessions.push(updatedSession);
        log.info(`Updated encryption session for id: ${connectionId}`);
    } catch (error) {
        throw new Error(`Error updating connection, ${String(error)}`);
    }
}

/**
 * CipherBufferDES
 * @param {import("mcos/shared").TEncryptionSession} encryptionSession
 * @param {Buffer} data
 * @return {{session: import("mcos/shared").TEncryptionSession, data: Buffer}}
 */
export function cipherBufferDES(encryptionSession, data) {
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
 * @param {import("mcos/shared").TEncryptionSession} encryptionSession
 * @param {Buffer} data
 * @return {{session: import("mcos/shared").TEncryptionSession, data: Buffer}}
 */
export function decipherBufferDES(encryptionSession, data) {
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
 * @param {import("mcos/shared").TBufferWithConnection} dataConnection
 * @param {Buffer} buffer
 * @param {import("mcos/shared").TServerLogger} log
 * @returns {{session: import("mcos/shared").TEncryptionSession, data: Buffer}}
 */
export function decryptBuffer(dataConnection, buffer, log) {
    const encryptionSession = selectEncryptors(dataConnection, log);
    const deciphered = encryptionSession.tsDecipher.update(buffer);
    return {
        session: encryptionSession,
        data: deciphered,
    };
}
