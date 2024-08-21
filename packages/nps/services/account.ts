import { LoginSchema, db } from "rusty-motors-database";
import { getServerLogger } from "rusty-motors-shared";
import type { DatabaseSchema } from "../../database/src/services/database";

const log = getServerLogger();

export async function populateGameUsers(): Promise<void> {
	await LoginSchema(db).insertOrIgnore({
		customer_id: 1,
		login_name: "admin",
		password: "admin",
		login_level: 1,
	});
}

export async function getUser(
	username: string,
	password: string,
): Promise<DatabaseSchema["login"]["record"] | null> {
	log.setName("getUser");

	log.debug(`Getting user ${username}, ${password}`);

	const userAccount = await LoginSchema(db).findOne({
		login_name: username,
		password,
	});

	if (!userAccount) {
		log.warn(`User ${username} not found`);
	}

	return userAccount;
}

export async function isSuperUser(
	username: string,
	password: string,
): Promise<boolean> {
	const user = await getUser(username, password);
	return user ? user.login_level === 1 : false;
}

// Path: packages/nps/services/account.ts
