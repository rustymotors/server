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
import { createCipheriv, createDecipheriv } from 'node:crypto';
import { errorMessage } from './index.js';
import { logger } from './logger/index.js';
const log = logger.child({ service: 'mcos:shared:encryption' });
/** @type {import("./types/index.js").EncryptionSession[]} */
const encryptionSessions = [];
/**
  *
  * @param {import("./types/index.js").BufferWithConnection} dataConnection
  * @param {import("./types/index.js").SessionRecord} keys
  * @return {import("./types/index.js").EncryptionSession}
  */
function generateEncryptionPair(dataConnection, keys) {
    // For use on Lobby packets
    // Deepcode ignore HardcodedSecret: This uses an empty IV
    const desIV = Buffer.alloc(8);
    const gsCipher = createCipheriv('des-cbc', Buffer.from(keys.skey, 'hex'), desIV);
    gsCipher.setAutoPadding(false);
    const gsDecipher = createDecipheriv('des-cbc', Buffer.from(keys.skey, 'hex'), desIV);
    gsDecipher.setAutoPadding(false);
    // For use on messageNode packets
    // File deepcode ignore InsecureCipher: RC4 is the encryption algorithum used here, file deepcode ignore HardcodedSecret: A blank IV is used here
    const tsCipher = createCipheriv('rc4', keys.sessionkey, '');
    const tsDecipher = createDecipheriv('rc4', keys.sessionkey, '');
    /** @type {import("./types/index.js").EncryptionSession} */
    const newSession = {
        connectionId: dataConnection.connectionId,
        sessionKey: keys.sessionkey,
        shortKey: keys.skey,
        gsCipher,
        gsDecipher,
        tsCipher,
        tsDecipher
    };
    return newSession;
}
/**
  *
  * @param {import("./types/index.js").BufferWithConnection} dataConnection
  * @return {import("./types/index.js").EncryptionSession}
  */
export function selectEncryptors(dataConnection) {
    const existingEncryptor = encryptionSessions.find(e => {
        return e.connectionId === dataConnection.connectionId;
    });
    if (typeof existingEncryptor !== 'undefined') {
        log.debug(`Located existing encryption session for connection id ${dataConnection.connectionId}`);
        return existingEncryptor;
    }
    const errMessage = `Unable to select encryptors for connection id ${dataConnection.connectionId}`;
    log.error(errMessage);
    throw new Error(errMessage);
}
/**
  *
  * @param {import("./types/index.js").SocketWithConnectionInfo} dataConnection
  * @return {import("./types/index.js").EncryptionSession}
  */
export function selectEncryptorsForSocket(dataConnection) {
    const existingEncryptor = encryptionSessions.find(e => {
        return e.connectionId === dataConnection.id;
    });
    if (typeof existingEncryptor !== 'undefined') {
        log.debug(`Located existing encryption session for socket with connection id ${dataConnection.id}`);
        return existingEncryptor;
    }
    const errMessage = `Unable to select encryptors for socket with connection id ${dataConnection.id}`;
    log.error(errMessage);
    throw new Error(errMessage);
}
/**
  *
  * @param {import("./types/index.js").BufferWithConnection} dataConnection
  * @param {import("./types/index.js").SessionRecord} keys
  * @return {import("./types/index.js").EncryptionSession}
  */
export function selectOrCreateEncryptors(dataConnection, keys) {
    const existingEncryptor = encryptionSessions.find(e => {
        return e.connectionId === dataConnection.connectionId;
    });
    if (typeof existingEncryptor !== 'undefined') {
        log.debug(`Located existing encryption session for connection id ${dataConnection.connectionId}`);
        return existingEncryptor;
    }
    const newSession = generateEncryptionPair(dataConnection, keys);
    log.debug(`Generated new encryption session for connection id ${dataConnection.connectionId}`);
    encryptionSessions.push(newSession);
    return newSession;
}
/**
   * Update the internal connection record
   *
   * @param {string} connectionId
   * @param {import("./types").EncryptionSession} updatedSession
   */
export function updateEncryptionSession(connectionId, updatedSession) {
    try {
        const index = encryptionSessions.findIndex(e => {
            return e.connectionId === connectionId;
        });
        encryptionSessions.splice(index, 1);
        encryptionSessions.push(updatedSession);
    }
    catch (error) {
        throw new Error(`Error updating connection, ${errorMessage(error)}`);
    }
}
/**
   * CipherBufferDES
   * @param {import('./types/index.js').EncryptionSession} encryptionSession
   * @param {Buffer} data
   * @return {{session: import('./types/index.js').EncryptionSession, data: Buffer}}
   */
export function cipherBufferDES(encryptionSession, data) {
    if (encryptionSession.gsCipher) {
        const ciphered = encryptionSession.gsCipher.update(data);
        return {
            session: encryptionSession,
            data: ciphered
        };
    }
    throw new Error('No DES cipher set on connection');
}
/**
   * Decrypt a command that is encrypted with DES
   * @param {import('./types/index.js').EncryptionSession} encryptionSession
   * @param {Buffer} data
   * @return {{session: import('./types/index.js').EncryptionSession, data: Buffer}}
   */
export function decipherBufferDES(encryptionSession, data) {
    if (encryptionSession.gsDecipher) {
        const deciphered = encryptionSession.gsDecipher.update(data);
        return {
            session: encryptionSession,
            data: deciphered
        };
    }
    throw new Error('No DES decipher set on connection');
}
/**
   * Decrypt the buffer contents
   * @param {import("./types/index.js").BufferWithConnection} dataConnection
   * @param {Buffer} buffer
   * @returns {{session: import('./types/index.js').EncryptionSession, data: Buffer}}
   */
export function decryptBuffer(dataConnection, buffer) {
    const encryptionSession = selectEncryptors(dataConnection);
    const deciphered = encryptionSession.tsDecipher.update(buffer);
    return {
        session: encryptionSession,
        data: deciphered
    };
}
//# sourceMappingURL=encryption.js.map