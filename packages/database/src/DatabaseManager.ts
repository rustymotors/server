import type {
    ConnectionRecord,
    UserInfo,
    IRunningServerInfo,
    DatabaseManager,
} from 'rusty-motors-shared';
import { Sequelize } from 'sequelize';

// This is a fake database table that holds sessions of currently logged in users
const _sessions: ConnectionRecord[] = [];
// This is a fake database table that holds user data
const _users: Map<number, UserInfo> = new Map();
// This is a fake database table to host the username on each connection
const _connections: Map<string, number> = new Map();

// This is a fake database table to host the game servers
const _gameServers: Map<number, IRunningServerInfo> = new Map();

/**
 * @module Database
 */

/**
 * Update a user record in the database

* @throws {Error} If unable to set or update
 */
async function updateGameServer(
    commId: number,
    gameServer: IRunningServerInfo,
): Promise<void> {
    try {
        _gameServers.set(commId, gameServer);
        return Promise.resolve();
    } catch (error) {
        throw Error(`Error updating user: ${String(error)}`);
    }
}

async function getGameServers(): Promise<IRunningServerInfo[]> {
    const gameServersArr = [];
    for (const server of _gameServers.values()) {
        gameServersArr.push(server);
    }
    return Promise.resolve(gameServersArr);
}

async function updateUser(user: {
    userId: number;
    userInfo: UserInfo;
}): Promise<void> {
    try {
        _users.set(user.userId, user.userInfo);
        return Promise.resolve();
    } catch (error) {
        throw Error(`Error updating user: ${String(error)}`);
    }
}

async function getUser(userId: number): Promise<UserInfo | undefined> {
    return Promise.resolve(_users.get(userId));
}

/**
 * Locate customer session encryption key in the database
 *
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
 * Create or overwrite a customer's session key record
 *
 * @param {number} customerId
 * @param {string} sessionKey
 * @param {string} contextId
 * @param {string} connectionId
 * @returns {Promise<void>}
 */
async function updateSessionKey(
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

    _sessions.splice(record, 1, updatedSession);

    return Promise.resolve();
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

/**
 * Update a user id by connection id

* @throws {Error} If unable to set or update
 */
async function updateConnection(
    connectionId: string,
    userId: number,
): Promise<void> {
    try {
        _connections.set(connectionId, userId);
        return Promise.resolve();
    } catch (error) {
        throw Error(`Error updating connection: ${String(error)}`);
    }
}

async function findUserByConnectionId(
    connectionId: string,
): Promise<number | undefined> {
    return Promise.resolve(_connections.get(connectionId));
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

export const databaseManager: DatabaseManager = {
    updateGameServer,
    getGameServers,
    updateUser,
    getUser,
    updateConnection,
    findUserByConnectionId,
    fetchSessionKeyByCustomerId,
    updateSessionKey,
    fetchSessionKeyByConnectionId,
};

export function getDatabaseManager() {
    return databaseManager
}
