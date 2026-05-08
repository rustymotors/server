import { describe, it, expect } from "vitest";
import { UserData, UserInfo } from "../src/UserData.js";

describe("UserInfo", () => {
    it("has a profileName", () => {
        const ui = new UserInfo();
        expect(ui.getUserName).not.toBe(undefined);
        ui.setUserName("Marty");
        expect(ui.getUserName()).toBe("Marty");
    });

    it("can deserialize from a buffer", () => {
        const ui = new UserInfo();
        const buffer = Buffer.from(
            "01030058000000150000000944722042726f776e0001000000680000002f00000005000000a5ceffff0d45acffffffffff00d8ffff02000000000000001127000000000000090000000000000000010000000000000e6649",
            "hex",
        );
        ui.deserialize(buffer.subarray(4));
        expect(ui.getUserName()).toBe("Dr Brown");
    });
});

describe("UserData", () => {
    it("has the correct length", () => {
        const expectedLength = 64;
        const ud = new UserData();
        expect(ud.sizeOf).toBe(expectedLength);
    });
});
