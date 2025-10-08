import { compareSync, hashSync } from "bcrypt";
import { DatabaseSync } from "node:sqlite";
import { getServerLogger } from "rusty-motors-shared";
import type { UserRecordMini } from "rusty-motors-shared";
import { SQL, DATABASE_PATH } from "./databaseConstrants.js";
import { sql, db } from "./database.js"

/**
 * Generates a hashed password using bcrypt
 * @param password - The plain text password to hash
 * @param saltRounds - Number of salt rounds for bcrypt (default: 10)
 * @returns The hashed password string
 */
export function generatePasswordHash(password: string, saltRounds = 10): string {
	return hashSync(password, saltRounds);
}

// Database Service Interface
export interface DatabaseService {
	isDatabaseConnected: () => boolean;
	updateSession: (
		customerId: number,
		contextId: string,
		userId: number,
	) => void;
	findSessionByContext: (contextId: string) => UserRecordMini | undefined;
}

/**
	 * Registers a new user in the database
	 * @param username - Unique username for the new user
	 * @param password - User's password (will be hashed)
	 * @param customerId - Associated customer ID
	 * @throws Error if registration fails for reasons other than duplicate username
	 */
export function registerNewUser(
	username: string,
	password: string,
	customerId: number,
) {
	const logger = getServerLogger("database");
	const hashedPassword = generatePasswordHash(password);
	try {
		db.query(sql`insert 
	into login (login_name, "password", customer_id) 
	values (${username}, ${hashedPassword}, ${customerId})
	on conflict (customer_id) do update set password = ${hashedPassword};`)
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.includes("UNIQUE constraint failed")
		) {
			logger.warn(`User ${username} already exists`);
			return;
		}
		throw error;
	}
}

	type DBLogin = {
		login_name: string,
		password: string,
		customer_id: number,
		login_level: number
	}

	/**
	 * Finds a user by username and password
	 * @param database - The SQLite database instance
	 * @param username - Username to search for
	 * @param password - Password to verify
	 * @returns UserRecordMini object containing user details
	 * @throws Error if user is not found
	 */
	export async function findUser(
		username: string,
		password: string,
	): Promise<{customerId: number, userName: string, loginLevel: number}> {
		const userRecords = await (db.query(sql`SELECT * FROM login WHERE login_name = ${username}`) as unknown as Promise<DBLogin[]>)
		if (userRecords.length === 0) {
			throw new Error("User not found");
		}
		const user = userRecords[0] as DBLogin
		if (!compareSync(password, user.password)) {
			throw new Error(`password invalid for user`)
		}
		return {
			customerId: user.customer_id,
			userName: user.login_name,
			loginLevel: user.login_level
		};
	}

// Database Implementation
export const DatabaseImpl = {


	/**
	 * Initializes the database schema by creating necessary tables and indexes
	 * @param database - The SQLite database instance
	 */
	initializeDatabase(database: DatabaseSync) {
		database.exec(
			"CREATE INDEX IF NOT EXISTS idx_user_username ON user(username)",
		);
		database.exec(
			"CREATE INDEX IF NOT EXISTS idx_user_customerId ON user(customerId)",
		);
		database.exec(SQL.CREATE_SESSION_TABLE);
		database.exec(
			"CREATE INDEX IF NOT EXISTS idx_session_customerId ON session(customerId)",
		);
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
			updateSession: (...args) => this.updateSession(db, ...args),
			findSessionByContext: (...args) => this.findSessionByContext(db, ...args),
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
		registerNewUser("admin", "admin", 654321);
		DatabaseImpl.updateSession(
			databaseInstance,
			1212555,
			"5213dee3a6bcdb133373b2d4f3b9962758",
			1,
		);
		DatabaseImpl.updateSession(
			databaseInstance,
			5551212,
			"d316cd2dd6bf870893dfbaaf17f965884e",
			2,
		);
		getServerLogger("database").info("Database initialized");
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

// Exported Database Service Instance
export const databaseService: DatabaseService = initializeDatabaseService();
