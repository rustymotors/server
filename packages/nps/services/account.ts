import { LoginSchema, db } from "rusty-motors-database";
import { getServerLogger } from "rusty-motors-shared";
import type { DatabaseSchema } from "rusty-motors-database";

const log = getServerLogger({});

export async function populateGameUsers(): Promise<void> {
    await LoginSchema(db).insertOrIgnore({
        customer_id: 1,
        login_name: "admin",
        password: "admin",
        login_level: 1,
    });
}

/**
 * Retrieves a user from the database based on the provided username and password.
 *
 * @param username - The username of the user to retrieve.
 * @param password - The password of the user to retrieve.
 * @returns A Promise that resolves to the user record from the database, or null if the user is not found.
 */
export async function getUser(
    username: string,
    password: string,
): Promise<DatabaseSchema["login"]["record"] | null> {

    log.debug(
        `Getting user: ${username}, password: ${"*".repeat(password.length)}`,
    );

    const userAccount = await LoginSchema(db).findOne({
        login_name: username,
        password,
    });

    if (!userAccount) {
        log.warn(`User ${username} not found`);
    }

    return userAccount;
}

/**
 * Checks if the user is a super user.
 *
 * @param username - The username of the user.
 * @param password - The password of the user.
 * @returns A promise that resolves to a boolean indicating if the user is a super user.
 */
export async function isSuperUser(
    username: string,
    password: string,
): Promise<boolean> {
    const user = await getUser(username, password);
    return user ? user.login_level === 1 : false;
}

// Path: packages/nps/services/account.ts
