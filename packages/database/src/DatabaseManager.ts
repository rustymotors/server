/**
 * This class abstracts database methods
 * @see {@link getDatabaseServer()} to get a singleton instance
 */

import { ConnectionRecord } from "../../interfaces/index.js";

// This is a fake database table that holds sessions of currently logged in users
const _sessions: ConnectionRecord[] = [];
// This is a fake database table that holds user data
const _users: Map<number, Buffer> = new Map();

/**
 * @module Database
 */

/**
 * Update a user record in the database
 
* @throws {Error} If the user record is not found
 */
export async function updateUser(user: {
    userId: number;
    userData: Buffer;
}): Promise<void> {
    try {
        _users.set(user.userId, user.userData);
    } catch (error) {
        throw Error(`Error updating user: ${String(error)}`);
    }
}

/**
 * Locate customer session encryption key in the database
 *
 * @throws {Error} If the session key is not found
 */
export async function fetchSessionKeyByCustomerId(
    customerId: number,
): Promise<ConnectionRecord> {
    const record = _sessions.find((session) => {
        return session.customerId === customerId;
    });
    if (typeof record === "undefined") {
        throw Error(`Session key not found for customer ${customerId}`);
    }
    return record;
}

/**
 * Create or overwrite a customer's session key record
 *
 * @param {number} customerId
 * @param {string} sessionKey
 * @param {string} contextId
 * @param {string} connectionId
 * @returns {Promise<void>}
 * @throws {Error} If the session key is not found
 */
export async function updateSessionKey(
    customerId: number,
    sessionKey: string,
    contextId: string,
    connectionId: string,
): Promise<void> {
    const sKey = sessionKey.slice(0, 16);

    const updatedSession: ConnectionRecord = {
        customerId,
        sessionKey,
        sKey,
        contextId,
        connectionId,
    };
    const record = _sessions.findIndex((session) => {
        return session.customerId === customerId;
    });
    if (record === -1) {
        const err = new Error(
            "Error updating session key: existing key not found",
        );
        throw Error(
            `Error updating session key: existing key not found for ${customerId}`,
        );
    }
    _sessions.splice(record, 1, updatedSession);
}

/**
 * Locate customer session encryption key in the database
 *
 * @param {string} connectionId
 * @returns {Promise<interfaces.ConnectionRecord>}
 * @throws {Error} If the session key is not found
 */
export async function fetchSessionKeyByConnectionId(
    connectionId: string,
): Promise<interfaces.ConnectionRecord> {
    const record = _sessions.find((session) => {
        return session.connectionId === connectionId;
    });
    if (typeof record === "undefined") {
        throw Error(`Session key not found for connection ${connectionId}`);
    }
    return record;
}
