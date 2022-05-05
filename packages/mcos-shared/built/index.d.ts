/**
 *
 *
 * @param {unknown} error
 * @return {string}
 */
export function errorMessage(error: unknown): string;
/**
 * Convert to zero padded hex
 *
 * @export
 * @param {Buffer} data
 * @return {string}
 */
export function toHex(data: Buffer): string;
export { TCPConnection } from "./tcpConnection.js";
export { EncryptionManager } from "./encryption-mgr.js";
export { selectEncryptors, selectEncryptorsForSocket, selectOrCreateEncryptors, updateEncryptionSession, decipherBufferDES, decryptBuffer, cipherBufferDES } from "./encryption.js";
//# sourceMappingURL=index.d.ts.map