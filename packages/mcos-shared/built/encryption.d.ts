/**
  *
  * @param {import("./types/index.js").BufferWithConnection} dataConnection
  * @return {import("./types/index.js").EncryptionSession}
  */
export function selectEncryptors(dataConnection: import("./types/index.js").BufferWithConnection): import("./types/index.js").EncryptionSession;
/**
  *
  * @param {import("./types/index.js").SocketWithConnectionInfo} dataConnection
  * @return {import("./types/index.js").EncryptionSession}
  */
export function selectEncryptorsForSocket(dataConnection: import("./types/index.js").SocketWithConnectionInfo): import("./types/index.js").EncryptionSession;
/**
  *
  * @param {import("./types/index.js").BufferWithConnection} dataConnection
  * @param {import("./types/index.js").SessionRecord} keys
  * @return {import("./types/index.js").EncryptionSession}
  */
export function selectOrCreateEncryptors(dataConnection: import("./types/index.js").BufferWithConnection, keys: import("./types/index.js").SessionRecord): import("./types/index.js").EncryptionSession;
/**
   * Update the internal connection record
   *
   * @param {string} connectionId
   * @param {import("./types").EncryptionSession} updatedSession
   */
export function updateEncryptionSession(connectionId: string, updatedSession: import("./types").EncryptionSession): void;
/**
   * CipherBufferDES
   * @param {import('./types/index.js').EncryptionSession} encryptionSession
   * @param {Buffer} data
   * @return {{session: import('./types/index.js').EncryptionSession, data: Buffer}}
   */
export function cipherBufferDES(encryptionSession: import('./types/index.js').EncryptionSession, data: Buffer): {
    session: import('./types/index.js').EncryptionSession;
    data: Buffer;
};
/**
   * Decrypt a command that is encrypted with DES
   * @param {import('./types/index.js').EncryptionSession} encryptionSession
   * @param {Buffer} data
   * @return {{session: import('./types/index.js').EncryptionSession, data: Buffer}}
   */
export function decipherBufferDES(encryptionSession: import('./types/index.js').EncryptionSession, data: Buffer): {
    session: import('./types/index.js').EncryptionSession;
    data: Buffer;
};
/**
   * Decrypt the buffer contents
   * @param {import("./types/index.js").BufferWithConnection} dataConnection
   * @param {Buffer} buffer
   * @returns {{session: import('./types/index.js').EncryptionSession, data: Buffer}}
   */
export function decryptBuffer(dataConnection: import("./types/index.js").BufferWithConnection, buffer: Buffer): {
    session: import('./types/index.js').EncryptionSession;
    data: Buffer;
};
//# sourceMappingURL=encryption.d.ts.map