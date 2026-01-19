// Constants
export const DATABASE_PATH = process.env["DATABASE_PATH"] ?? "data/lotus.db";
// SQL Queries
export const SQL = {
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
	INSERT_USER:
		`insert 
	into login (login_name, "password", customer_id) 
	values ($username, $password, $customer_id)
	on conflict (customer_id) do update set password = $password;`,
	FIND_USER: "SELECT * FROM user WHERE username = ? AND password = ?",
	GET_ALL_USERS: "SELECT * FROM user",
	UPDATE_SESSION:
		"INSERT OR REPLACE INTO session (contextId, customerId, profileId) VALUES (?, ?, ?)",
	FIND_SESSION_BY_CONTEXT: "SELECT * FROM session WHERE contextId = ?",
} as const;
