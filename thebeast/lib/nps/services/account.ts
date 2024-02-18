export type User = {
    username: string;
    password: string;
    customerId: number;
    createdAt: Date;
    updatedAt: Date;
};

const users: User[] = [];

export async function populateGameUsers(): Promise<void> {
    // Create the default admin user
    users.push({
        username: "admin",
        password: "admin",
        customerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    // Create the default molly user
    users.push({
        username: "molly",
        password: "molly",
        customerId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
}

export async function getUser(username: string): Promise<User | undefined> {
    return users.find((user) => user.username === username);
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
