export type User = {
    username: string;
    password: string;
    customerId: number;
};

export const gameUsers = new Map<string, User>([]);

export function populateGameUsers(users: Map<string, User>): void {
    users.set("admin", {
        username: "admin",
        password: "admin",
        customerId: 1,
    });
}

export function getUser(username: string): User | undefined {
    if (gameUsers.has(username)) {
        return gameUsers.get(username);
    }
    return undefined;
}

export function userExists(username: string): boolean {
    return gameUsers.has(username);
}

export function addUser(user: User): void {
    gameUsers.set(user.username, user);
}

export function deleteUser(username: string): void {
    gameUsers.delete(username);
}

export function deleteAllUsers(): void {
    gameUsers.clear();
}

export function getCustomerId(username: string): number | undefined {
    const user = getUser(username);
    if (typeof user === "undefined") {
        return undefined;
    }
    return user.customerId;
}

export function checkPassword(user: User, password: string): boolean {
    return user.password === password;
}
