import { AuthServer, getAuthServer } from "@mcos/auth";
import { describe, it, expectTypeOf } from "vitest";
import { mock } from "node:test";

describe("getAuthServer", () => {
    it("should return an instance of AuthServer", () => {
        const log = mock.fn();
        const authServer = getAuthServer(log);
        expectTypeOf(authServer).toEqualTypeOf<AuthServer>();
    });
});
