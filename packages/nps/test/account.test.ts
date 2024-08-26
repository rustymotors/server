import { describe, expect, it } from "vitest";
import { getUser, isSuperUser, populateGameUsers } from "../services/account.js";

describe("getUser", () => {
    it("returns the user record if found", async () => {
        // arrange
        const username = "admin";
        const password = "admin";
        populateGameUsers()

        // act
        const result = await getUser(username, password);

        // assert
        expect(result).not.toBeNull();
        expect(result?.login_name).toBe(username);
        expect(result?.password).toBe(password);
    });

    it("returns null if the user is not found", async () => {
        // arrange
        const username = "nonexistent";
        const password = "password";

        // act
        const result = await getUser(username, password);

        // assert
        expect(result).toBeNull();
    });

    it("returns true if the user is a super user", async () => {
        // arrange
        const username = "admin";
        const password = "admin";

        // act
        const result = await isSuperUser(username, password);

        // assert
        expect(result).toBe(true);
    });

    it("returns false if the user is not a super user", async () => {
        // arrange
        const username = "regularuser";
        const password = "password";

        // act
        const result = await isSuperUser(username, password);

        // assert
        expect(result).toBe(false);
    });
});
