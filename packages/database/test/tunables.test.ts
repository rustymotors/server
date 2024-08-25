import { describe, expect, it } from "vitest";
import { getTunables } from "../src/services/tunables";

describe("Tunables", () => {
    it("should return the correct tunable value", () => {
        const tunables = getTunables();
        expect(tunables.getTunable("clubCreationFee")).toBe(5000);
        expect(tunables.getTunable("clubCreationMinimumLevel")).toBe(10);
        // Add more test cases for other tunable values
    });

    it("should throw an error for an invalid tunable name", () => {
        const tunables = getTunables();
        expect(() => tunables.getTunable("invalidTunable")).toThrowError(
            "Tunable invalidTunable not found",
        );
    });

    it("should set the tunable value correctly", () => {
        const tunables = getTunables();
        tunables.setTunable("clubCreationFee", 10000);
        expect(tunables.getTunable("clubCreationFee")).toBe(10000);
        // Add more test cases for other tunable values
    });

    it("should throw an error when setting an invalid tunable name", () => {
        const tunables = getTunables();
        expect(() => tunables.setTunable("invalidTunable", 100)).toThrowError(
            "Tunable invalidTunable not found",
        );
    });
});
