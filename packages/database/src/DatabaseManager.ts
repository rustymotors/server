import type { ConnectionRecord } from 'rusty-motors-shared';
import { Sequelize } from 'sequelize';

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
async function updateUser(user: {
    userId: number;
    userData: Buffer;
}): Promise<void> {
    try {
        _users.set(user.userId, user.userData);
        return Promise.resolve();
    } catch (error) {
        throw Error(`Error updating user: ${String(error)}`);
    }
}

/**
 * Locate customer session encryption key in the database
 *
 * @param {number} customerId
 * @returns {Promise<ConnectionRecord>}
 * @throws {Error} If the session key is not found
 */
async function fetchSessionKeyByCustomerId(
    customerId: number,
): Promise<ConnectionRecord> {
    const record = _sessions.find((session) => {
        return session.customerId === customerId;
    });
    if (typeof record === 'undefined') {
        throw Error(`Session key not found for customer ${customerId}`);
    }
    return Promise.resolve(record);
}



/**
 * Locate customer session encryption key in the database
 *
 * @param {string} connectionId
 * @returns {Promise<ConnectionRecord>}
 * @throws {Error} If the session key is not found
 */
async function fetchSessionKeyByConnectionId(
    connectionId: string,
): Promise<ConnectionRecord> {
    const record = _sessions.find((session) => {
        return session.connectionId === connectionId;
    });
    if (typeof record === 'undefined') {
        throw Error(`Session key not found for connection ${connectionId}`);
    }
    return Promise.resolve(record);
}

let database: Sequelize;

export function getDatabase(): Sequelize {
    if (!database) {
        const databaseUrl = process.env['DATABASE_URL'];
        if (typeof databaseUrl === 'undefined') {
            throw new Error('DATABASE_URL is not defined');
        }

        database = new Sequelize(databaseUrl, {
            logging: false,
        });
    }
    return database;
}

export interface DatabaseManager {
    updateUser: typeof updateUser;
    fetchSessionKeyByCustomerId: typeof fetchSessionKeyByCustomerId;
    updateSessionKey: typeof updateSessionKey;
    fetchSessionKeyByConnectionId: typeof fetchSessionKeyByConnectionId;
}

export const databaseManager: DatabaseManager = {
    updateUser,
    fetchSessionKeyByCustomerId,
    updateSessionKey,
    fetchSessionKeyByConnectionId,
};
