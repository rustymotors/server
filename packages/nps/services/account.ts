import { getDatabase } from "../../database";
import { user as userSchema } from "../../../schema/user";
import { eq, and } from "drizzle-orm";
import { getServerLogger } from "../../shared";

const log = getServerLogger();



export async function populateUsers(): Promise<void> {

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

export async function getUserFromDb(username: string, password: string): Promise<typeof userSchema.$inferSelect | null> {
    
    const userAccount = await getDatabase().select().from(userSchema).where(
        and(
            eq(userSchema.userName, username),
            eq(userSchema.password, password),
        ),        
    ).limit(1).then((result) => {
        if (result.length === 0) {
            return null;
        }

        const record =  result[0];

        if (typeof record === "undefined") {
            return null;
        }

        return record;
    });

    log.debug(`getUser: ${JSON.stringify(userAccount)}`);

    return userAccount
}

export async function isSuperUser(username: string, password: string): Promise<boolean> {
    const user = await getUserFromDb(username, password);
    return user ? user.isSuperUser === 1 : false;
}

// Path: packages/nps/services/account.ts
