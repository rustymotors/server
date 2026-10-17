import { describe, it, expect } from "vitest";
import { requireEnv } from "./requireEnv.js";

describe("requireEnv", () => {
    it("returns the values of all requested variables", () => {
        expect(requireEnv(["A", "B"], { A: "1", B: "2", C: "3" })).toEqual({
            A: "1",
            B: "2",
        });
    });

    it("names every missing variable in one error", () => {
        expect(() => requireEnv(["A", "B", "C"], { B: "2" })).toThrow(
            "Missing required environment variables: A, C",
        );
    });

    it("treats an empty string as missing", () => {
        expect(() => requireEnv(["A"], { A: "" })).toThrow(
            "Missing required environment variables: A",
        );
    });

    it("reads process.env by default", () => {
        process.env["REQUIRE_ENV_TEST_VAR"] = "x";
        try {
            expect(requireEnv(["REQUIRE_ENV_TEST_VAR"])).toEqual({
                REQUIRE_ENV_TEST_VAR: "x",
            });
        } finally {
            delete process.env["REQUIRE_ENV_TEST_VAR"];
        }
    });
});
