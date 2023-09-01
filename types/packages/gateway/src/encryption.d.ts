/// <reference types="node" />
/// <reference types="node" />
import { createCipheriv, createDecipheriv } from "node:crypto";
import { EncryptionSession, SocketWithConnectionInfo, SessionKeys, TBufferWithConnection, ClientConnection, Logger, IEncryptionManager } from "../../interfaces/index.js";
/**
 *
 * @deprecated use {@link EncryptionManager.generateEncryptionPair()} instead
 */
export declare function generateEncryptionPair(dataConnection: SocketWithConnectionInfo, keys: SessionKeys): EncryptionSession;
/**
 *
 * @deprecated use {@link EncryptionManager.selectEncryptors()} instead
 */
export declare function selectEncryptors({ dataConnection, connection, log, }: {
    dataConnection: TBufferWithConnection;
    connection?: ClientConnection;
    log: Logger;
}): EncryptionSession;
/**
 *
 * @deprecated use {@link EncryptionManager.createEncrypters()} instead
 */
export declare function createEncrypters(dataConnection: SocketWithConnectionInfo, keys: SessionKeys, log: Logger): EncryptionSession;
/**
 * Update the internal connection record
 * @deprecated use {@link EncryptionManager.generateEncryptionPair()} instead
 */
export declare function updateEncryptionSession(connectionId: string, updatedSession: EncryptionSession, log: Logger): void;
/**
 * CipherBufferDES
 * @deprecated use {@link EncryptionRecord.encryptBufferDES()} instead
 */
export declare function cipherBufferDES(encryptionSession: EncryptionSession, data: Buffer): {
    session: EncryptionSession;
    data: Buffer;
};
/**
 * Decrypt a command that is encrypted with DES
 * @deprecated use {@link EncryptionRecord.decryptBufferDES()} instead
 */
export declare function decipherBufferDES(encryptionSession: EncryptionSession, data: Buffer): {
    session: EncryptionSession;
    data: Buffer;
};
/**
 * Decrypt the buffer contents
 * @deprecated use {@link EncryptionRecord.decryptBuffer()} instead
 */
export declare function decryptBuffer(dataConnection: TBufferWithConnection, // Legacy type
connection: ClientConnection, buffer: Buffer, log: Logger): {
    session: EncryptionSession;
    data: Buffer;
};
export declare class EncryptionRecord implements EncryptionSession {
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
    generateEncryptionPair(connection: ClientConnection, keys: SessionKeys): EncryptionSession;
    selectEncryptors(connection: ClientConnection): EncryptionSession | undefined;
    createEncrypters(connection: ClientConnection, keys: SessionKeys): EncryptionSession;
}
/**
 * Get the singletons instance of the encryption manager
 */
export declare function getEncryptionManager(): EncryptionManager;
//# sourceMappingURL=encryption.d.ts.map