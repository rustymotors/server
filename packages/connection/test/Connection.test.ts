import { describe, expect, it, vi } from "vitest";
import {
    createCommandEncryptionPair,
    verifyLegacyCipherSupport,
} from "../src/Connection";
import { McosEncryptionPair } from "../../shared";

describe("createCommandEncryptionPair", () => {
    it("should create an encryption pair with a valid key", () => {
        const validKey = "1234567890abcdef1234567890abcdef";
        const encryptionPair = createCommandEncryptionPair(validKey);
        expect(encryptionPair).toBeInstanceOf(McosEncryptionPair);
        expect(encryptionPair._cipher).toBeDefined();
        expect(encryptionPair._decipher).toBeDefined();
    });
    it("should throw an error if the key is too short", () => {
        const shortKey = "short";
        expect(() => createCommandEncryptionPair(shortKey)).toThrow(
            "Key too short: length 5, value short",
        );
    });
});

vi.mock("node:crypto", async (importOriginal) => {
    return {
        ...(await importOriginal<typeof import("node:crypto")>()),
        getCiphers: vi
            .fn()
            .mockReturnValueOnce(["rc4"])
            .mockReturnValueOnce(["des-cbc"])
            .mockReturnValueOnce(["rc4", "des-cbc"]),
    };
});


describe("verifyLegacyCipherSupport", () => {



    it("should throw an error if DES-CBC cipher is not available", () => {

        expect(verifyLegacyCipherSupport).toThrowError(
            "DES-CBC cipher not available",
        );
    });

    it("should throw an error if RC4 cipher is not available", () => {
        expect(verifyLegacyCipherSupport).toThrowError(
            "RC4 cipher not available",
        );
    });

    it("should not throw an error if both DES-CBC and RC4 ciphers are available", () => {
        expect(verifyLegacyCipherSupport).not.toThrow();

        vi.resetAllMocks();
    });
});
