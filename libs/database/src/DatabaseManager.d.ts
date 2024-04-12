/**
 * This class abstracts database methods
 * @see {@link getDatabaseServer()} to get a singleton instance
 */
/// <reference types="node" />

import { ConnectionRecord } from "rusty-shared";

/**
 * This class abstracts database methods
 * @see {@link getDatabaseServer()} to get a singleton instance
 */
/**
 * @module Database
 */
/**
 * Update a user record in the database
 
* @throws {Error} If the user record is not found
 */
export declare function updateUser(user: {
    userId: number;
    userData: Buffer;
}): Promise<void>;
/**
 * Locate customer session encryption key in the database
 *
 * @throws {Error} If the session key is not found
 */
export declare function fetchSessionKeyByCustomerId(
    customerId: number,
): Promise<ConnectionRecord>;
/**
 * Create or overwrite a customer's session key record
 *
 * @param {number} customerId
 * @param {string} sessionKey
 * @param {string} contextId
 * @param {string} connectionId
 * @returns {Promise<void>}
 */
export declare function updateSessionKey(
    customerId: number,
    sessionKey: string,
    contextId: string,
    connectionId: string,
): Promise<void>;
/**
 * Locate customer session encryption key in the database
 *
 * @param {string} connectionId
 * @returns {Promise<interfaces.ConnectionRecord>}
 * @throws {Error} If the session key is not found
 */
export declare function fetchSessionKeyByConnectionId(
    connectionId: string,
): Promise<ConnectionRecord>;
