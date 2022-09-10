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
    Cipher,
    createCipheriv,
    createDecipheriv,
    Decipher,
} from "node:crypto";
import { logger } from "mcos-logger/src/index.js";
import type { EncryptionSession } from "mcos-types/types.js";
import type { Session } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const log = logger.child({ service: "mcos:shared:encryption" });

function generateEncryptionPair(
    connectionId: string,
    keys: Session
): EncryptionSession {
    // For use on Lobby packets
    const { sessionKey, sKey } = keys;
    const stringKey = Buffer.from(sessionKey, "hex");
    Buffer.from(stringKey.subarray(0, 16));

    // Deepcode ignore HardcodedSecret: This uses an empty IV
    const { gsCipher, gsDecipher } = createGSCipher(sKey);

    // For use on messageNode packets

    // File deepcode ignore InsecureCipher: RC4 is the encryption algorithum used here, file deepcode ignore HardcodedSecret: A blank IV is used here
    const { tsCipher, tsDecipher } = createTSCipher(stringKey);

    const newSession: EncryptionSession = {
        connectionId,
        gsCipher,
        gsDecipher,
        tsCipher,
        tsDecipher,
    };

    return newSession;
}

/**
 * Generate a set of encryphers for the transactions service
 * @param {Buffer} stringKey
 * @returns {{
 *   tsCipher: Cipher;
 *   tsDecipher: Decipher;
 * }}
 */
function createTSCipher(stringKey: Buffer): {
    tsCipher: Cipher;
    tsDecipher: Decipher;
} {
    const tsCipher = createCipheriv("rc4", stringKey.subarray(0, 16), "");
    const tsDecipher = createDecipheriv("rc4", stringKey.subarray(0, 16), "");
    return { tsCipher, tsDecipher };
}

/**
 * Generate a set of encryphers for the game service
 * @param {string} sKey
 * @returns {{
 *   tsCipher: Cipher;
 *   tsDecipher: Decipher;
 * }}
 */
function createGSCipher(sKey: string): {
    gsCipher: Cipher;
    gsDecipher: Decipher;
} {
    const desIV = Buffer.alloc(8);

    const gsCipher = createCipheriv("des-cbc", Buffer.from(sKey, "hex"), desIV);
    gsCipher.setAutoPadding(false);

    const gsDecipher = createDecipheriv(
        "des-cbc",
        Buffer.from(sKey, "hex"),
        desIV
    );
    gsDecipher.setAutoPadding(false);
    return { gsCipher, gsDecipher };
}

/**
 *
 * @param {ISocketWithConnectionInfo} connection
 * @param {ISessionRecord} keys
 * @returns {IEncryptionSession}
 */
export function createEncryptors(
    connectionId: string,
    keys: Session
): EncryptionSession {
    const newSession = generateEncryptionPair(connectionId, keys);

    log.debug(
        `Generated new encryption session for connection id ${connectionId}`
    );

    return newSession;
}

/**
 * CipherBufferDES
 * @param {IEncryptionSession} encryptionSession
 * @param {Buffer} data
 * @return {{session: IEncryptionSession, data: Buffer}}
 */
export function cipherBufferDES(
    encryptionSession: EncryptionSession,
    data: Buffer
): { session: EncryptionSession; data: Buffer } {
    const ciphered = encryptionSession.gsCipher.update(data);
    return {
        session: encryptionSession,
        data: ciphered,
    };
}

/**
 * Decrypt a command that is encrypted with DES
 * @param {IEncryptionSession} encryptionSession
 * @param {Buffer} data
 * @return {{session: IEncryptionSession, data: Buffer}}
 */
export function decipherBufferDES(
    encryptionSession: EncryptionSession,
    data: Buffer
): Buffer {
    const deciphered = encryptionSession.gsDecipher.update(data);
    return deciphered;
}

/**
 * Decrypt the buffer contents
 */
export async function decryptBuffer(
    connectionId: string,
    buffer: Buffer
): Promise<{ session: EncryptionSession; data: Buffer }> {
    const keys = await prisma.session.findFirst({
        where: {
            connectionId,
        },
    });

    if (keys === null) {
        throw new Error("Error fetching session keys in decryptBuffer");
    }

    const encryptionSession = createEncryptors(connectionId, keys);
    const deciphered = encryptionSession.tsDecipher.update(buffer);
    return {
        session: encryptionSession,
        data: deciphered,
    };
}
