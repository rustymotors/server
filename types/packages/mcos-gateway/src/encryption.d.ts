/// <reference types="node" />
/// <reference types="node" />
import { TEncryptionSession, TSocketWithConnectionInfo, TSessionRecord, TBufferWithConnection, TServerLogger, IConnection, IEncryptionManager } from "mcos/shared/interfaces";
import { createCipheriv, createDecipheriv } from "node:crypto";
/**
 * @global
 * @typedef {object} SessionRecord
 * @property {string} skey
 * @property {string} sessionkey
 */
/**
 *
 * @deprecated use {@link EncryptionManager.generateEncryptionPair()} instead
 */
export declare function generateEncryptionPair(dataConnection: TSocketWithConnectionInfo, keys: TSessionRecord): TEncryptionSession;
/**
 *
 * @deprecated use {@link EncryptionManager.selectEncryptors()} instead
 */
export declare function selectEncryptors({ dataConnection, connection, log, }: {
    dataConnection: TBufferWithConnection;
    connection?: IConnection;
    log: TServerLogger;
}): TEncryptionSession;
/**
 *
 * @deprecated use {@link EncryptionManager.createEncrypters()} instead
 */
export declare function createEncrypters(dataConnection: TSocketWithConnectionInfo, keys: TSessionRecord, log: TServerLogger): TEncryptionSession;
/**
 * Update the internal connection record
 * @deprecated use {@link EncryptionManager.generateEncryptionPair()} instead
 */
export declare function updateEncryptionSession(connectionId: string, updatedSession: TEncryptionSession, log: TServerLogger): void;
/**
 * CipherBufferDES
 * @deprecated use {@link EncryptionSession.encryptBufferDES()} instead
 */
export declare function cipherBufferDES(encryptionSession: TEncryptionSession, data: Buffer): {
    session: TEncryptionSession;
    data: Buffer;
};
/**
 * Decrypt a command that is encrypted with DES
 * @deprecated use {@link EncryptionSession.decryptBufferDES()} instead
 */
export declare function decipherBufferDES(encryptionSession: TEncryptionSession, data: Buffer): {
    session: TEncryptionSession;
    data: Buffer;
};
/**
 * Decrypt the buffer contents
 * @deprecated use {@link EncryptionSession.decryptBuffer()} instead
 */
export declare function decryptBuffer(dataConnection: TBufferWithConnection, // Legacy type
connection: IConnection, buffer: Buffer, log: TServerLogger): {
    session: TEncryptionSession;
    data: Buffer;
};
export declare class EncryptionSession implements TEncryptionSession {
    connectionId: string;
    remoteAddress: string;
    localPort: number;
    sessionKey: string;
    sKey: string;
    gsCipher: ReturnType<typeof createCipheriv>;
    gsDecipher: ReturnType<typeof createDecipheriv>;
    tsCipher: ReturnType<typeof createCipheriv>;
    tsDecipher: ReturnType<typeof createDecipheriv>;
    constructor(connectionId: string, remoteAddress: string, localPort: number, sessionKey: string, sKey: string, gsCipher: ReturnType<typeof createCipheriv>, gsDecipher: ReturnType<typeof createDecipheriv>, tsCipher: ReturnType<typeof createCipheriv>, tsDecipher: ReturnType<typeof createDecipheriv>);
    decryptBuffer(buffer: Buffer): Buffer;
    encryptBuffer(buffer: Buffer): Buffer;
    decryptBufferDES(buffer: Buffer): Buffer;
    encryptBufferDES(buffer: Buffer): Buffer;
}
export declare class EncryptionManager implements IEncryptionManager {
    private encryptionSessions;
    static _instance: EncryptionManager;
    generateEncryptionPair(connection: IConnection, keys: TSessionRecord): TEncryptionSession;
    selectEncryptors(connection: IConnection): TEncryptionSession | undefined;
    createEncrypters(connection: IConnection, keys: TSessionRecord): TEncryptionSession;
}
/**
 * Get the singletons instance of the encryption manager
 */
export declare function getEncryptionManager(): EncryptionManager;
