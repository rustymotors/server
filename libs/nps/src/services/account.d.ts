export type User = {
    username: string;
    password: string;
    customerId: number;
    createdAt: Date;
    updatedAt: Date;
};
export declare function populateGameUsers(): Promise<void>;
export declare function getUser(username: string): Promise<User | undefined>;
export declare function addUser(user: User): Promise<void>;
export declare function deleteUser(username: string): Promise<void>;
export declare function getCustomerId(
    username: string,
): Promise<number | undefined>;
export declare function checkPassword(
    user: User,
    password: string,
): Promise<boolean>;
