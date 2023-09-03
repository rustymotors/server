import { describe, it, expect, vi, beforeAll } from "vitest";
import { handleGetCert, handleGetKey, handleGetRegistry } from "./index.js";
import { ShardServer } from "./ShardServer.js";
import pino from "pino";
import { Configuration } from "../../shared/Configuration.js";

describe("Shard service", () => {

    beforeAll(() => {
        vi.mock("fs", () => {
            return {
                readFileSync: vi.fn().mockImplementation((path: string) => {
                    if (path.includes("fakeCert.pem")) {
                        return "Hello! I'm an SSL cert. Honest.";
                    }
                    if (path.includes("fakePub.key")) {
                        return "I'm a public key! Wheeeeeeeee";
                    }
                    throw new Error("Unknown file");
                }),
            };
        });
    });

    it("should return an instance when getInstance() is called", () => {
        // arrange
        const config: Configuration = {
            host: "",
            certificateFile: "",
            privateKeyFile: "",
            publicKeyFile: "",
            logLevel: "info",
        };
        vi.mock("pino", () => {
            return {
                default: vi.fn(),
            };
        });

        const expectedClass = ShardServer;

        // act
        const server = ShardServer.getInstance(config, pino());

        // assert
        expect(server).to.be.instanceOf(expectedClass);
    });

    describe("handleGetCert", () => {
        it("should return file contents", () => {
            // arrange
            const config: Configuration = {
                host: "",
                certificateFile: "fakeCert.pem",
                privateKeyFile: "",
                publicKeyFile: "",
                logLevel: "info",
            };

            const expectedText = "Hello! I'm an SSL cert. Honest.";

            // act
            const result = handleGetCert(config);

            // assert
            expect(result).to.equal(expectedText);
            vi.doUnmock("fs");
        });
    });

    describe("handleGetRegistry", () => {
        it("should return file contents", () => {
            // arrange
            const config: Configuration = {
                host: "0.10.0.1",
                certificateFile: "",
                privateKeyFile: "",
                publicKeyFile: "",
                logLevel: "info",
            };

            const expectedText = '"AuthLoginServer"="0.10.0.1"';

            // act
            const result = handleGetRegistry(config);

            // assert
            expect(result).to.contain(expectedText);
        });
    });

    describe("handleGetKey", () => {
        it("should return file contents", () => {
            // arrange
            const config: Configuration = {
                host: "",
                certificateFile: "",
                privateKeyFile: "",
                publicKeyFile: "fakePub.key",
                logLevel: "info",
            };

            const expectedText = "I'm a public key! Wheeeeeeeee";

            // act
            const result = handleGetKey(config);

            // assert
            expect(result).to.equal(expectedText);
            vi.doUnmock("fs");
        });
    });
});
