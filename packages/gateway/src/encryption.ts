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

import { createCipheriv, createDecipheriv, getCiphers } from "node:crypto";
import { EncryptionSession, SocketWithConnectionInfo, SessionKeys, TBufferWithConnection, ClientConnection, Logger, IEncryptionManager } from "../../interfaces/index.js";

const encryptionSessions: EncryptionSession[] = [];

/**
 *
 * @deprecated use {@link EncryptionManager.generateEncryptionPair()} instead
 */
export function generateEncryptionPair(
    dataConnection: SocketWithConnectionInfo,
    keys: SessionKeys
): EncryptionSession {
    verifyLegacyCipherSupport();
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
    const newSession: EncryptionSession = {
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
 * @deprecated use {@link EncryptionManager.selectEncryptors()} instead
 */
export function selectEncryptors({
    dataConnection,
    connection,
    log,
}: {
    dataConnection: TBufferWithConnection; // Legacy type
    connection?: ClientConnection;
    log: Logger;
}): EncryptionSession {
    verifyLegacyCipherSupport();
    const { localPort, remoteAddress } = dataConnection.connection;

    if (
        typeof localPort === "undefined" ||
        typeof remoteAddress === "undefined"
    ) {
        const err = new Error(
            "[selectEncryptors]Either localPort or remoteAddress is missing on socket. Can not continue."
        );
        throw err;
    }
    const wantedId = `${remoteAddress}:${localPort}`;

    if (typeof connection !== "undefined") {
        const existingEncryptionSession =
            getEncryptionManager().selectEncryptors(connection);

        log(
            "debug",
            `[selectEncryptors] Found existing encryption session: ${JSON.stringify(
                existingEncryptionSession
            )}`
        );
    }

    const existingEncryptor = encryptionSessions.find((e) => {
        const thisId = `${e.remoteAddress}:${e.localPort}`;
        log("debug", `[selectEncryptors] Checking ${thisId} === ${wantedId} ?`);
        return thisId === wantedId;
    });

    log(
        "debug",
        `[selectEncryptors] Found existing encryptor: ${JSON.stringify(
            existingEncryptor
        )}`
    );

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
    throw err;
}

/**
 *
 * @deprecated use {@link EncryptionManager.createEncrypters()} instead
 */
export function createEncrypters(
    dataConnection: SocketWithConnectionInfo,
    keys: SessionKeys,
    log: Logger
): EncryptionSession {
    verifyLegacyCipherSupport();
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
 * @deprecated use {@link EncryptionManager.generateEncryptionPair()} instead
 */
export function updateEncryptionSession(
    connectionId: string,
    updatedSession: EncryptionSession,
    log: Logger
) {
    verifyLegacyCipherSupport();
    try {
        const index = encryptionSessions.findIndex((e) => {
            return e.connectionId === connectionId;
        });
        encryptionSessions.splice(index, 1);
        encryptionSessions.push(updatedSession);
        log("debug", `Updated encryption session for id: ${connectionId}`);
    } catch (error) {
        const err = new Error(`Error updating connection, ${String(error)}`);
        throw err;
    }
}

/**
 * CipherBufferDES
 * @deprecated use {@link EncryptionRecord.encryptBufferDES()} instead
 */
export function cipherBufferDES(
    encryptionSession: EncryptionSession,
    data: Buffer
): { session: EncryptionSession; data: Buffer } {
    verifyLegacyCipherSupport();
    if (typeof encryptionSession.gsCipher !== "undefined") {
        const ciphered = encryptionSession.gsCipher.update(data);
        return {
            session: encryptionSession,
            data: ciphered,
        };
    }

    const err = new Error("No DES cipher set on connection");
    throw err;
}

/**
 * Decrypt a command that is encrypted with DES
 * @deprecated use {@link EncryptionRecord.decryptBufferDES()} instead
 */
export function decipherBufferDES(
    encryptionSession: EncryptionSession,
    data: Buffer
): { session: EncryptionSession; data: Buffer } {
    verifyLegacyCipherSupport();
if (typeof encryptionSession.gsDecipher !== "undefined") {
        const deciphered = encryptionSession.gsDecipher.update(data);
        return {
            session: encryptionSession,
            data: deciphered,
        };
    }

    const err = new Error("No DES decipher set on connection");
    throw err;
}

/**
 * Decrypt the buffer contents
 * @deprecated use {@link EncryptionRecord.decryptBuffer()} instead
 */
export function decryptBuffer(
    dataConnection: TBufferWithConnection, // Legacy type
    connection: ClientConnection,
    buffer: Buffer,
    log: Logger
): { session: EncryptionSession; data: Buffer } {
    verifyLegacyCipherSupport();
    const encryptionSession = selectEncryptors({
        dataConnection,
        connection,
        log,
    });
    const deciphered = encryptionSession.tsDecipher.update(buffer);
    return {
        session: encryptionSession,
        data: deciphered,
    };
}

export class EncryptionRecord implements EncryptionSession {
    connectionId: string;
    remoteAddress: string;
    localPort: number;
    sessionKey: string;
    sKey: string;
    gsCipher: ReturnType<typeof createCipheriv>;
    gsDecipher: ReturnType<typeof createDecipheriv>;
    tsCipher: ReturnType<typeof createCipheriv>;
    tsDecipher: ReturnType<typeof createDecipheriv>;

    constructor(
        connectionId: string,
        remoteAddress: string,
        localPort: number,
        sessionKey: string,
        sKey: string,
        gsCipher: ReturnType<typeof createCipheriv>,
        gsDecipher: ReturnType<typeof createDecipheriv>,
        tsCipher: ReturnType<typeof createCipheriv>,
        tsDecipher: ReturnType<typeof createDecipheriv>
    ) {
        verifyLegacyCipherSupport();
        this.connectionId = connectionId;
        this.remoteAddress = remoteAddress;
        this.localPort = localPort;
        this.sessionKey = sessionKey;
        this.sKey = sKey;
        this.gsCipher = gsCipher;
        this.gsDecipher = gsDecipher;
        this.tsCipher = tsCipher;
        this.tsDecipher = tsDecipher;
    }

    decryptBuffer(buffer: Buffer): Buffer {
        const deciphered = this.tsDecipher.update(buffer);
        return deciphered;
    }

    encryptBuffer(buffer: Buffer): Buffer {
        const ciphered = this.tsCipher.update(buffer);
        return ciphered;
    }

    decryptBufferDES(buffer: Buffer): Buffer {
        const deciphered = this.gsDecipher.update(buffer);
        return deciphered;
    }

    encryptBufferDES(buffer: Buffer): Buffer {
        const ciphered = this.gsCipher.update(buffer);
        return ciphered;
    }
}

export class EncryptionManager implements IEncryptionManager {
    private encryptionSessions: EncryptionSession[] = [];
    static _instance: EncryptionManager;

    generateEncryptionPair(
        connection: ClientConnection,
        keys: SessionKeys
    ): EncryptionSession {
        verifyLegacyCipherSupport();

        // For use on Lobby packets
        const { sessionKey, sKey } = keys;
        const stringKey = Buffer.from(sessionKey, "hex");
        Buffer.from(stringKey.subarray(0, 16));

        // Deepcode ignore HardcodedSecret: This uses an empty IV
        const desIV = Buffer.alloc(8);

        const gsCipher = createCipheriv(
            "des-cbc",
            Buffer.from(sKey, "hex"),
            desIV
        );
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
        const tsDecipher = createDecipheriv(
            "rc4",
            stringKey.subarray(0, 16),
            ""
        );

        const newSession = new EncryptionRecord(
            connection.id,
            connection.remoteAddress,
            connection.port,
            keys.sessionKey,
            keys.sKey,
            gsCipher,
            gsDecipher,
            tsCipher,
            tsDecipher
        );

        return newSession;
    }

    selectEncryptors(connection: ClientConnection): EncryptionSession | undefined {
        verifyLegacyCipherSupport();
        const wantedId = `${connection.remoteAddress}:${connection.port}`;

        const existingEncryptor = this.encryptionSessions.find((e) => {
            const thisId = `${e.remoteAddress}:${e.localPort}`;
            return thisId === wantedId;
        });

        return existingEncryptor;
    }

    createEncrypters(
        connection: ClientConnection,
        keys: SessionKeys
    ): EncryptionSession {
        verifyLegacyCipherSupport();
        const newSession = this.generateEncryptionPair(connection, keys);
        this.encryptionSessions.push(newSession);
        return newSession;
    }
}

/**
 * Get the singletons instance of the encryption manager
 */
export function getEncryptionManager(): EncryptionManager {
    if (typeof EncryptionManager._instance === "undefined") {
        EncryptionManager._instance = new EncryptionManager();
    }
    return EncryptionManager._instance;
}

export function verifyLegacyCipherSupport() {
    const cipherList = getCiphers();
    if (!cipherList.includes("des-cbc")) {
        const err = new Error("DES-CBC cipher not available");
        throw err;
    }
    if (!cipherList.includes("rc4")) {
        const err = new Error("RC4 cipher not available");
        throw err;
    }
}   