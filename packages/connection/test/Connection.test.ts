import { describe, expect, it, vi } from "vitest";
import {
    createCommandEncryptionPair,
    verifyLegacyCipherSupport,
    Connection,
} from "../src/Connection";
import { McosEncryptionPair, type TServerLogger } from "../../shared";
import { Socket } from "node:net";

const mockLogger: TServerLogger = {
    setName: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    getName: vi.fn(),
    info: vi.fn(),
    trace: vi.fn(),
    warn: vi.fn(),
    resetName: vi.fn(),};

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

vi.mock("node:net", async (importOriginal) => {
    return {
        ...(await importOriginal<typeof import("node:net")>()),
        Socket: class {
            end = vi.fn();
            destroy = vi.fn();
            on = vi.fn((event, callback: () => void) => {
                if (event === "error") {
                    callback();
                }
            });
        },
    };
});

describe("verifyLegacyCipherSupport", () => {
    it("should throw an error if DES-CBC cipher is not available", () => {
        expect(() => verifyLegacyCipherSupport()).toThrowError(
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

describe("Connection", () => {
    describe("handleServerSocketError", () => {
        it("should handle ECONNRESET by logging and not closing the connection", () => {

            const mockSocket = new Socket


            const connection = new Connection(mockSocket, "123", mockLogger);

            const error = Error("socket error") as NodeJS.ErrnoException;
            error.code = "ECONNRESET";

            connection.handleServerSocketError(error);

            expect(mockLogger.setName).toHaveBeenCalledWith(
                "Connection:handleSocketError",
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "Connection 123 reset",
            );
        });

        it("should handle other errors by logging, capturing the exception, and closing the connection", () => {
            const mockSocket = new Socket

            const connection = new Connection(mockSocket, "123", mockLogger);

            const error = Error("socket error");

            connection.handleServerSocketError(error);

            expect(mockLogger.setName).toHaveBeenCalledWith(
                "Connection:handleSocketError",
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                "Socket error: socket error on connection 123",
            );
        });
    });
});
