import { sequelize } from "../../../packages/database/src/services/database.js";
import { GameUser } from "../../../packages/database/src/models/GameUser.entity.js";

export type User = {
    username: string;
    password: string;
    customerId: number;
};

export async function populateGameUsers(): Promise<void> {
    await GameUser.sync();

    // Create the default admin user
    await GameUser.upsert({
        username: "admin",
        password: "admin",
        customerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    // Create the default molly user
    await GameUser.upsert({
        username: "molly",
        password: "molly",
        customerId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
}

export async function getUser(username: string): Promise<GameUser | null> {
    return await GameUser.findOne({
        where: {
            username: username,
        },
    });
}

export async function addUser(user: User): Promise<void> {
    await GameUser.upsert({
        username: user.username,
        password: user.password,
        customerId: user.customerId,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
}

export async function deleteUser(username: string): Promise<void> {
    await GameUser.destroy({
        where: {
            username: username,
        },
    });
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
