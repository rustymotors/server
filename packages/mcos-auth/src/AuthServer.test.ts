import { describe, it } from "mocha";
import { expect } from "chai";
import { AuthServer } from "./AuthServer.js";
import { getAuthServer } from "./AuthServer.js";

describe("AuthServer", () => {
    it("should be a function", () => {
        expect(typeof AuthServer).to.equal("function");
    });
});

describe("getAuthServer", () => {
    it("should be a function", () => {
        expect(typeof getAuthServer).to.equal("function");
    });
});
