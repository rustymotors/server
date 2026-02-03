import { compareSync, hashSync } from "bcrypt";
import { getServerLogger } from "rusty-motors-shared";
import type { ServerLogger, UserRecordMini } from "rusty-motors-shared";
import { SQL, DATABASE_PATH } from "./databaseConstrants.js";
import { sql, db } from "./database.js"
import Database from 'better-sqlite3';

export class DatabaseService {

	private static databaseInstance: DatabaseService;
	private database!: Database.Database;
	private logger: ServerLogger

	constructor(databasePath: string, logger = getServerLogger("DatabaseService")) {
		this.logger = logger
		if (!(DatabaseService.databaseInstance instanceof DatabaseService)) {
			this.initializeDatabase(databasePath);
			DatabaseService.databaseInstance = this
			return this
		}

		return DatabaseService.databaseInstance

	}
	/**
	 * Generates a hashed password using bcrypt
	 * @param password - The plain text password to hash
	 * @param saltRounds - Number of salt rounds for bcrypt (default: 10)
	 * @returns The hashed password string
	 */
	public generatePasswordHash(password: string, saltRounds = 10): string {
		return hashSync(password, saltRounds);
	}

	// Database Service Interface
	//  private interface DatabaseService {
	// 	isDatabaseConnected: () => boolean;
	// 	updateSession: (
	// 		customerId: number,
	// 		contextId: string,
	// 		userId: number,
	// 	) => void;
	// 	findSessionByContext: (contextId: string) => UserRecordMini | undefined;
	// }

	/**
		 * Registers a new user in the database
		 * @param username - Unique username for the new user
		 * @param password - User's password (will be hashed)
		 * @param customerId - Associated customer ID
		 * @throws Error if registration fails for reasons other than duplicate username
		 */
	public registerNewUser(
		username: string,
		password: string,
		customerId: number,
	) {
		const hashedPassword = this.generatePasswordHash(password);
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
				this.logger.warn(`User ${username} already exists`);
				return;
			}
			throw error;
		}
	}


	/**
	 * Finds a user by username and password
	 * @param database - The SQLite database instance
	 * @param username - Username to search for
	 * @param password - Password to verify
	 * @returns UserRecordMini object containing user details
	 * @throws Error if user is not found
	 */
	public async findUser(
		username: string,
		password: string,
	): Promise<{ customerId: number, userName: string, loginLevel: number }> {
		const userRecords = await (db.query(sql`SELECT * FROM login WHERE login_name = ${username}`) as unknown as Promise<DBLogin[]>)
		if (userRecords.length === 0) {
			this.logger.error("user not found")

			throw new Error("User not found");
		}
		const user = userRecords[0] as DBLogin
		if (!compareSync(password, user.password)) {
			this.logger.error("password invalid")
			throw new Error(`password invalid for user`)
		}
		return {
			customerId: user.customer_id,
			userName: user.login_name,
			loginLevel: user.login_level
		};
	}

	// START OF PUBLIC API


	/**
	 * Initializes the database schema by creating necessary tables and indexes
	 * @param database - The SQLite database instance
	 */
	public initializeDatabase(databasePath: string) {

		this.database = new Database(databasePath);
		this.database.pragma('journal_mode = WAL');

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

		this.registerNewUser("admin", "admin", 654321);
		this.updateSession(
			1212555,
			"5213dee3a6bcdb133373b2d4f3b9962758",
			1,
		);
		this.updateSession(
			5551212,
			"d316cd2dd6bf870893dfbaaf17f965884e",
			2,
		);
		getServerLogger("database").info("Database initialized");
	}

	/**
	 * Updates or creates a new session for a user
	 * @param database - The SQLite database instance
	 * @param customerId - Customer ID associated with the session
	 * @param contextId - Unique context ID for the session
	 * @param userId - ID of the user owning the session
	 */
	public updateSession(
		customerId: number,
		contextId: string,
		profileId: number,
	) {
		const insert = this.database.prepare(SQL.UPDATE_SESSION);
		insert.run(contextId, customerId, profileId);
	}

	private findSessionByContext(
		contextId: string,
	): UserRecordMini | undefined {
		this.logger.info("findSessionByContext")
		try {
			const query = this.database.prepare(SQL.FIND_SESSION_BY_CONTEXT);
			const user = query.get(contextId) as UserRecordMini | undefined;
			this.logger.info("findSessionByContext-end")
			return user;

		} catch (error: unknown) {
			this.logger.error((error as Error).message)
			throw error
		}
	}
	// END OF PUBLIC API





	public get isDatabaseConnected(): boolean {
		return true
	}


	public findCustomerByContext(
		contextId: string,
	): UserRecordMini | undefined {
		this.logger.info("findCustomerByContext")
		const user = this.findSessionByContext(contextId);
		return user;
	}
}



type DBLogin = {
	login_name: string,
	password: string,
	customer_id: number,
	login_level: number
}

export const getDatabaseService = () => new DatabaseService(DATABASE_PATH)

export const findCustomerByContext = (contextId: string) => getDatabaseService().findCustomerByContext(contextId)

export const findUser = getDatabaseService().findUser

