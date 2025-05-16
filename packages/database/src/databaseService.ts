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

import { hashSync } from 'bcrypt';
import { DatabaseSync } from 'node:sqlite';
import { getServerLogger } from 'rusty-motors-logger';
import type { UserRecordMini } from 'rusty-motors-shared';
import { SQL, DATABASE_PATH } from './databaseConstrants.js';

// Database Service Interface
export interface DatabaseService {
    isDatabaseConnected: () => boolean;
    registerUser: (
        username: string,
        password: string,
        customerId: number,
    ) => void;
    findUser: (username: string, password: string) => UserRecordMini;
    getAllUsers: () => UserRecordMini[];
    updateSession: (
        customerId: number,
        contextId: string,
        userId: number,
    ) => void;
    findSessionByContext: (contextId: string) => UserRecordMini | undefined;
}

// Database Implementation
export const DatabaseImpl = {
    /**
     * Generates a hashed password using bcrypt
     * @param password - The plain text password to hash
     * @param saltRounds - Number of salt rounds for bcrypt (default: 10)
     * @returns The hashed password string
     */
    generatePasswordHash(password: string, saltRounds = 10): string {
        const hash = hashSync(password, saltRounds);
        return hash;
    },

    /**
     * Initializes the database schema by creating necessary tables and indexes
     * @param database - The SQLite database instance
     */
    initializeDatabase(database: DatabaseSync) {
        database.exec(SQL.CREATE_USER_TABLE);
        database.exec(
            'CREATE INDEX IF NOT EXISTS idx_user_username ON user(username)',
        );
        database.exec(
            'CREATE INDEX IF NOT EXISTS idx_user_customerId ON user(customerId)',
        );
        database.exec(SQL.CREATE_SESSION_TABLE);
        database.exec(
            'CREATE INDEX IF NOT EXISTS idx_session_customerId ON session(customerId)',
        );
    },

    /**
     * Registers a new user in the database
     * @param database - The SQLite database instance
     * @param username - Unique username for the new user
     * @param password - User's password (will be hashed)
     * @param customerId - Associated customer ID
     * @throws Error if registration fails for reasons other than duplicate username
     */
    registerNewUser(
        database: DatabaseSync,
        username: string,
        password: string,
        customerId: number,
    ) {
        const logger = getServerLogger('database');
        const hashedPassword = this.generatePasswordHash(password);
        try {
            database
                .prepare(SQL.INSERT_USER)
                .run(username, hashedPassword, customerId);
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.includes('UNIQUE constraint failed')
            ) {
                logger.warn(`User ${username} already exists`);
                return;
            }
            throw error;
        }
    },

    /**
     * Finds a user by username and password
     * @param database - The SQLite database instance
     * @param username - Username to search for
     * @param password - Password to verify
     * @returns UserRecordMini object containing user details
     * @throws Error if user is not found
     */
    findUser(
        database: DatabaseSync,
        username: string,
        password: string,
    ): UserRecordMini {
        const query = database.prepare(SQL.FIND_USER);
        const hashedPassword = this.generatePasswordHash(password);
        const user = query.get(
            username,
            hashedPassword,
        ) as unknown as UserRecordMini | null;
        if (user == null) {
            throw new Error('User not found');
        }
        return {
            customerId: user.customerId,
            profileId: user.profileId,
            contextId: user.contextId,
        };
    },

    /**
     * Retrieves all users from the database
     * @param database - The SQLite database instance
     * @returns Array of UserRecordMini objects
     */
    getAllUsers(database: DatabaseSync): UserRecordMini[] {
        const query = database.prepare(SQL.GET_ALL_USERS);
        const users = query.all() as unknown as UserRecordMini[];
        return users;
    },

    /**
     * Updates or creates a new session for a user
     * @param database - The SQLite database instance
     * @param customerId - Customer ID associated with the session
     * @param contextId - Unique context ID for the session
     * @param userId - ID of the user owning the session
     */
    updateSession(
        database: DatabaseSync,
        customerId: number,
        contextId: string,
        profileId: number,
    ) {
        const insert = database.prepare(SQL.UPDATE_SESSION);
        insert.run(contextId, customerId, profileId);
    },

    findSessionByContext(
        database: DatabaseSync,
        contextId: string,
    ): UserRecordMini | undefined {
        const query = database.prepare(SQL.FIND_SESSION_BY_CONTEXT);
        const user = query.get(contextId) as UserRecordMini | undefined;
        return user;
    },

    /**
     * Creates a DatabaseService interface implementation
     * @param db - The SQLite database instance
     * @returns DatabaseService interface with implemented database operations
     */
    createDatabaseService(db: DatabaseSync): DatabaseService {
        return {
            isDatabaseConnected: () => db !== null,
            registerUser: (...args) => this.registerNewUser(db, ...args),
            findUser: (...args) => this.findUser(db, ...args),
            getAllUsers: () => this.getAllUsers(db),
            updateSession: (...args) => this.updateSession(db, ...args),
            findSessionByContext: (...args) =>
                this.findSessionByContext(db, ...args),
        };
    },
} as const;

// Database Instance Management
let databaseInstance: DatabaseSync | null = null;

/**
 * Initializes and returns a database service instance
 * @returns DatabaseService interface with database operations
 */
function initializeDatabaseService(): DatabaseService {
    if (databaseInstance === null) {
        databaseInstance = new DatabaseSync(DATABASE_PATH);
        DatabaseImpl.initializeDatabase(databaseInstance);
        DatabaseImpl.registerNewUser(
            databaseInstance,
            'admin',
            'admin',
            5551212,
        );
        DatabaseImpl.updateSession(
            databaseInstance,
            1212555,
            '5213dee3a6bcdb133373b2d4f3b9962758',
            1,
        );
        DatabaseImpl.updateSession(
            databaseInstance,
            5551212,
            'd316cd2dd6bf870893dfbaaf17f965884e',
            2,
        );
        getServerLogger('database').info('Database initialized');
    }

    return DatabaseImpl.createDatabaseService(databaseInstance);
}

export function findCustomerByContext(
    contextId: string,
): UserRecordMini | undefined {
    const database = initializeDatabaseService();
    const user = database.findSessionByContext(contextId);
    return user;
}

const UserAccounts = [
    {
        username: 'new',
        ticket: '5213dee3a6bcdb133373b2d4f3b9962758',
        password: 'new',
        customerId: '123456',
    },
    {
        username: 'admin',
        ticket: 'd316cd2dd6bf870893dfbaaf17f965884e',
        password: 'admin',
        customerId: '654321',
    },
];

const AuthTickets = [
    {
        ticket: '5213dee3a6bcdb133373b2d4f3b9962758',
        customerId: '123456',
    },
    {
        ticket: 'd316cd2dd6bf870893dfbaaf17f965884e',
        customerId: '654321',
    },
];

/**
 * Generates a ticket for the given customer ID.
 *
 * @param customerId - The ID of the customer for whom the ticket is being generated.
 * @returns The ticket associated with the given customer ID, or an empty string if no ticket is found.
 */
export function generateTicket(customerId: string): string {
    const ticket = AuthTickets.find((t) => t.customerId === customerId);
    if (ticket) {
        return ticket.ticket;
    }
    return '';
}

/**
 * Retrieves a user account based on the provided username and password.
 *
 * @param username - The username of the account to retrieve.
 * @param password - The password of the account to retrieve.
 * @returns An object containing the username, ticket, and customerId if the account is found, or null if not.
 */
export function retrieveUserAccount(
    username: string,
    password: string,
): { username: string; ticket: string; customerId: string } | null {
    const customer = UserAccounts.find(
        (account) =>
            account.username === username && account.password === password,
    );

    return customer ?? null;
}

// Exported Database Service Instance
export const databaseService: DatabaseService = initializeDatabaseService();
