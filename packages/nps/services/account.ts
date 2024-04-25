import { getDatabase } from "../../database";
import { user as userSchema } from "../../../schema/user";
import { eq } from "drizzle-orm";
import { getServerLogger } from "../../shared";

const log = getServerLogger();



export async function populateGameUsers(): Promise<void> {

    await getDatabase().insert(userSchema).values([
        {
            userId: 1,
            userName: "admin",
            password: "admin",
            customerId: 1,
            isSuperUser: 1,
        },
        {
            userId: 2,
            userName: "molly",
            password: "molly",
            customerId: 2,
            isSuperUser: 0,
        },
    ]).onConflictDoNothing();
}

export async function getUser(username: string): Promise<typeof userSchema.$inferSelect | null> {
    
    const userAccount = await getDatabase().select().from(userSchema).where(
        eq(userSchema.userName, username )
    ).limit(1).then((result) => {
        if (result.length === 0) {
            return null;
        }

        const record =  result[0];

        if (typeof record === "undefined") {
            return null;
        }

        return {
            userId: record.userId,
            userName: record.userName,
            password: record.password,
            customerId: record.customerId,
            isSuperUser: record.isSuperUser,
        }
    });

    log.debug(`getUser: ${JSON.stringify(userAccount)}`);

    return userAccount
}

export async function addUser(user: User): Promise<void> {
    users.push({
        username: user.username,
        password: user.password,
        customerId: user.customerId,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
}

export async function deleteUser(username: string): Promise<void> {
    const index = users.findIndex((user) => user.username === username);
    users.splice(index, 1);
}

export async function getCustomerId(
    username: string,
): Promise<number | undefined> {
    const user = await getUser(username);
    if (typeof user === "undefined") {
        return undefined;
    }
    return user ? user.customerId : undefined;
}

export async function checkPassword(
    user: User,
    password: string,
): Promise<boolean> {
    return user.password === password;
}
