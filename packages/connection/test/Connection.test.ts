import { describe, expect, it } from "vitest";
import { createCommandEncryptionPair  } from "../src/Connection";
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
            "Key too short: length 5, value short"
        );
    });
});
