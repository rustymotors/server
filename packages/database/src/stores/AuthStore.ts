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

import { compareSync, hashSync } from "bcrypt";
import Database from "better-sqlite3";
import { type ConnectionPool, type ConnectionPoolConfig, sql } from "@databases/pg";
import * as pg from "@databases/pg";
import { getServerLogger, type ServerLogger, type UserRecordMini, type IAuthStore } from "rusty-motors-shared";

type createConnectionPool = (
    connectionConfig?: string | ConnectionPoolConfig | undefined,
) => ConnectionPool;

const SQL = {
    CREATE_USER_TABLE: `
        CREATE TABLE IF NOT EXISTS user(
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        customerId INTEGER PRIMARY KEY NOT NULL
    ) STRICT`,
    CREATE_SESSION_TABLE: `
        CREATE TABLE IF NOT EXISTS session(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contextId TEXT UNIQUE NOT NULL,
        customerId INTEGER NOT NULL,
        profileId INTEGER DEFAULT 0
    ) STRICT`,
    UPDATE_SESSION:
        "INSERT OR REPLACE INTO session (contextId, customerId, profileId) VALUES (?, ?, ?)",
    FIND_SESSION_BY_CONTEXT: "SELECT * FROM session WHERE contextId = ?",
} as const;

type DBLogin = {
    login_name: string;
    password: string;
    customer_id: number;
    login_level: number;
};

/**
 * Auth store implementation - manages authentication and local session cache
 * Uses SQLite for local session cache and PostgreSQL for login credentials
 */
export class AuthStore implements IAuthStore {
    private database: Database.Database;
    private pgPool: ConnectionPool | null = null;
    private logger: ServerLogger;
    private postgresUrl: string | undefined;
    private _isDatabaseConnected: boolean = false;

    constructor(
        sqlitePath: string,
        postgresUrl?: string,
        logger?: ServerLogger,
    ) {
        this.logger = logger ?? getServerLogger("AuthStore");
        this.postgresUrl = postgresUrl;

        // Initialize SQLite database
        this.database = new Database(sqlitePath);
        this.database.pragma("journal_mode = WAL");

        this.initializeSchema();
        this._isDatabaseConnected = true;
    }

    get isDatabaseConnected(): boolean {
        return this._isDatabaseConnected;
    }

    private initializeSchema(): void {
        this.database.exec(SQL.CREATE_USER_TABLE);
        this.database.exec(
            "CREATE INDEX IF NOT EXISTS idx_user_username ON user(username)",
        );
        this.database.exec(
            "CREATE INDEX IF NOT EXISTS idx_user_customerId ON user(customerId)",
        );
        this.database.exec(SQL.CREATE_SESSION_TABLE);
        this.database.exec(
            "CREATE INDEX IF NOT EXISTS idx_session_customerId ON session(customerId)",
        );

        // Register demo user and initial sessions
        this.registerNewUser("admin", "admin", 654321);
        this.registerNewUser("molly", "molly", 21188);
        this.updateSession(21188, "5213dee3a6bcdb133373b2d4f3b9962758", 1);
        this.updateSession(5551212, "d316cd2dd6bf870893dfbaaf17f965884e", 2);
        this.logger.info("Database initialized");
    }

    private ensurePostgresPool(): ConnectionPool {
        if (!this.pgPool) {
            if (!this.postgresUrl) {
                throw new Error(
                    "DATABASE_URL environment variable is required for PostgreSQL operations",
                );
            }
            this.pgPool = (pg.default as unknown as createConnectionPool)({
                bigIntMode: "bigint",
            });
        }
        return this.pgPool;
    }

    private generatePasswordHash(password: string, saltRounds = 10): string {
        return hashSync(password, saltRounds);
    }

    registerNewUser(
        username: string,
        password: string,
        customerId: number,
    ): void {
        const hashedPassword = this.generatePasswordHash(password);
        const db = this.ensurePostgresPool();
        try {
            db.query(sql`INSERT
                INTO login (login_name, "password", customer_id)
                VALUES (${username}, ${hashedPassword}, ${customerId})
                ON CONFLICT (customer_id) DO UPDATE SET password = ${hashedPassword};`);
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.includes("violates unique constraint")
            ) {
                this.logger.warn(`User ${username} already exists`);
                return;
            }
            throw error;
        }
    }

    async findUser(
        username: string,
        password: string,
    ): Promise<{ customerId: number; userName: string; loginLevel: number }> {
        const db = this.ensurePostgresPool();
        const userRecords = (await db.query(
            sql`SELECT * FROM login WHERE login_name = ${username}`,
        )) as unknown as DBLogin[];

        if (userRecords.length === 0) {
            this.logger.error("user not found");
            throw new Error("User not found");
        }

        const user = userRecords[0] as DBLogin;
        if (!compareSync(password, user.password)) {
            this.logger.error("password invalid");
            throw new Error("password invalid for user");
        }

        return {
            customerId: user.customer_id,
            userName: user.login_name,
            loginLevel: user.login_level,
        };
    }

    updateSession(
        customerId: number,
        contextId: string,
        profileId: number,
    ): void {
        const insert = this.database.prepare(SQL.UPDATE_SESSION);
        insert.run(contextId, customerId, profileId);
    }

    findCustomerByContext(contextId: string): UserRecordMini | undefined {
        this.logger.info("findCustomerByContext");
        try {
            const query = this.database.prepare(SQL.FIND_SESSION_BY_CONTEXT);
            const user = query.get(contextId) as UserRecordMini | undefined;
            this.logger.info("findCustomerByContext-end");
            return user;
        } catch (error: unknown) {
            this.logger.error((error as Error).message);
            throw error;
        }
    }
}
