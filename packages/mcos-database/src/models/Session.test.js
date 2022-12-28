import { describe, it } from "mocha";
import { expect } from "chai";
import { Session } from "./Session.js";

describe("Session model", function () {
    it("should have a schema property", function () {
        expect(Session.schema).not.equal("");
    });
});
