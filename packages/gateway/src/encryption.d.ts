import { McosEncryptionPair } from "@rustymotors/shared";
/**
 * This function creates a new encryption pair for use with the game server
 *
 * @param {string} key The key to use for encryption
 * @returns {McosEncryptionPair} The encryption pair
 */
export declare function createCommandEncryptionPair(
    key: string,
): McosEncryptionPair;
/**
 * This function creates a new encryption pair for use with the database server
 *
 * @param {string} key The key to use for encryption
 * @returns {McosEncryptionPair} The encryption pair
 * @throws Error if the key is too short
 */
export declare function createDataEncryptionPair(
    key: string,
): McosEncryptionPair;
/**
 * This function checks if the server supports the legacy ciphers
 *
 * @returns void
 * @throws Error if the server does not support the legacy ciphers
 */
export declare function verifyLegacyCipherSupport(): void;
