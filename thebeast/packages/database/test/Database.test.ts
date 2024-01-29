import { getServerLogger } from "../../shared/log.js";
import { Database } from "../src/DatabaseManager.js";
import { describe, it, expect, vi } from "vitest";

describe("Database", () => {
    it("returns the same instance", () => {
        // arrange
        const log = getServerLogger({});
        // act
        const instance1 = Database.getInstance(log);
        const instance2 = Database.getInstance(log);
        // assert
        expect(instance1).toEqual(instance2);
    });

    describe("fetchSessionKeyByCustomerId", () => {
        it("throws when session key is not found", async () => {
            // arrange

            const log = getServerLogger({});
            const instance = Database.getInstance(log);
            const customerId = 1234;
            // act
            try {
                await instance.fetchSessionKeyByCustomerId(customerId);
            } catch (error) {
                // assert
                expect(error).toEqual(
                    new Error(
                        `Session key not found for customer ${customerId}`,
                    ),
                );
            }
        });
    });

    describe("fetchSessionKeyByConnectionId", () => {
        it("throws when session key is not found", async () => {
            // arrange

            const log = getServerLogger({});
            const instance = Database.getInstance(log);
            const connectionId = "1234";
            // act
            try {
                await instance.fetchSessionKeyByConnectionId(connectionId);
            } catch (error) {
                // assert
                expect(error).toEqual(
                    new Error(
                        `Session key not found for connection ${connectionId}`,
                    ),
                );
            }
        });
    });

    describe("updateUser", () => {
        it("returns successfully when passed a valid user record", async () => {
            // arrange

            const log = getServerLogger({});
            const instance = Database.getInstance(log);
            const userRecord = {
                contextId: "1234",
                customerId: 1234,
                userId: 1234,
                userData: Buffer.from("1234"),
            };
            // act + assert
            expect(() => {
                instance.updateUser(userRecord);
            }).not.toThrow();
        });
    });
});
