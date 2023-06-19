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

import {
    Sentry,
    TBufferWithConnection,
    TEncryptionSession,
    TServerLogger,
    TSessionRecord,
    TSocketWithConnectionInfo,
} from "mcos/shared";
import { createCipheriv, createDecipheriv } from "node:crypto";

/** @type {TEncryptionSession[]} */
const encryptionSessions: TEncryptionSession[] = [];

/**
 * @global
 * @typedef {object} SessionRecord
 * @property {string} skey
 * @property {string} sessionkey
 */

/**
 * @param {TSocketWithConnectionInfo} dataConnection
 * @param {TSessionRecord} keys
 * @returns {TEncryptionSession}
 */
function generateEncryptionPair(
    dataConnection: TSocketWithConnectionInfo,
    keys: TSessionRecord
): TEncryptionSession {
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

    /** @type {TEncryptionSession} */
    const newSession: TEncryptionSession = {
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
 * @param {TBufferWithConnection} dataConnection
 * @param {TServerLogger} log
 * @returns {TEncryptionSession}
 */
export function selectEncryptors(
    dataConnection: TBufferWithConnection,
    log: TServerLogger
): TEncryptionSession {
    const { localPort, remoteAddress } = dataConnection.connection;

    if (
        typeof localPort === "undefined" ||
        typeof remoteAddress === "undefined"
    ) {
        const err = new Error(
            `[selectEncryptors]Either localPort or remoteAddress is missing on socket. Can not continue.`
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }
    const wantedId = `${remoteAddress}:${localPort}`;

    const existingEncryptor = encryptionSessions.find((e) => {
        const thisId = `${e.remoteAddress}:${e.localPort}`;
        log("debug", `[selectEncryptors] Checking ${thisId} === ${wantedId} ?`);
        return thisId === wantedId;
    });

    if (typeof existingEncryptor !== "undefined") {
        log(
            "debug",
            `Located existing encryption session for connection id ${dataConnection.connectionId}`
        );
        return existingEncryptor;
    }

    const err = new Error(
        `Unable to select encryptors for connection id ${dataConnection.connectionId}`
    );
    Sentry.addBreadcrumb({ level: "error", message: err.message });
    throw err;
}

/**
 *
 * @param {TSocketWithConnectionInfo} dataConnection
 * @param {TSessionRecord} keys
 * @param {TServerLogger} log
 * @returns {TEncryptionSession}
 */
export function createEncrypters(
    dataConnection: TSocketWithConnectionInfo,
    keys: TSessionRecord,
    log: TServerLogger
): TEncryptionSession {
    const newSession = generateEncryptionPair(dataConnection, keys);

    log(
        "debug",
        `Generated new encryption session for connection id ${dataConnection.id}`
    );

    encryptionSessions.push(newSession);
    return newSession;
}

/**
 * Update the internal connection record
 * @param {string} connectionId
 * @param {TEncryptionSession} updatedSession
 * @param {TServerLogger} log
 */
export function updateEncryptionSession(
    connectionId: string,
    updatedSession: TEncryptionSession,
    log: TServerLogger
) {
    try {
        const index = encryptionSessions.findIndex((e) => {
            return e.connectionId === connectionId;
        });
        encryptionSessions.splice(index, 1);
        encryptionSessions.push(updatedSession);
        log("debug", `Updated encryption session for id: ${connectionId}`);
    } catch (error) {
        Sentry.captureException(error);
        const err = new Error(`Error updating connection, ${String(error)}`);
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }
}

/**
 * CipherBufferDES
 * @param {TEncryptionSession} encryptionSession
 * @param {Buffer} data
 * @return {{session: TEncryptionSession, data: Buffer}}
 */
export function cipherBufferDES(
    encryptionSession: TEncryptionSession,
    data: Buffer
): { session: TEncryptionSession; data: Buffer } {
    if (typeof encryptionSession.gsCipher !== "undefined") {
        const ciphered = encryptionSession.gsCipher.update(data);
        return {
            session: encryptionSession,
            data: ciphered,
        };
    }

    const err = new Error("No DES cipher set on connection");
    Sentry.addBreadcrumb({ level: "error", message: err.message });
    throw err;
}

/**
 * Decrypt a command that is encrypted with DES
 * @param {TEncryptionSession} encryptionSession
 * @param {Buffer} data
 * @return {{session: TEncryptionSession, data: Buffer}}
 */
export function decipherBufferDES(
    encryptionSession: TEncryptionSession,
    data: Buffer
): { session: TEncryptionSession; data: Buffer } {
    if (typeof encryptionSession.gsDecipher !== "undefined") {
        const deciphered = encryptionSession.gsDecipher.update(data);
        return {
            session: encryptionSession,
            data: deciphered,
        };
    }

    const err = new Error("No DES decipher set on connection");
    Sentry.addBreadcrumb({ level: "error", message: err.message });
    throw err;
}

/**
 * Decrypt the buffer contents
 * @param {TBufferWithConnection} dataConnection
 * @param {Buffer} buffer
 * @param {TServerLogger} log
 * @returns {{session: TEncryptionSession, data: Buffer}}
 */
export function decryptBuffer(
    dataConnection: TBufferWithConnection,
    buffer: Buffer,
    log: TServerLogger
): { session: TEncryptionSession; data: Buffer } {
    const encryptionSession = selectEncryptors(dataConnection, log);
    const deciphered = encryptionSession.tsDecipher.update(buffer);
    return {
        session: encryptionSession,
        data: deciphered,
    };
}
