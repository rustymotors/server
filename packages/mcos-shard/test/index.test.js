import { describe, it } from "mocha";
import { expect } from "chai";
import {
    handleGetCert,
    handleGetKey,
    handleGetRegistry,
    ShardServer,
} from "../src/index.js";

describe("Shard service", () => {
    it("should return an instance when getInstance() is called", () => {
        // arrange
        /** @type {import("mcos/shared").TServerConfiguration} */
        const config = {
            CERTIFICATE_FILE: "",
            EXTERNAL_HOST: "",
            PRIVATE_KEY_FILE: "",
            PUBLIC_KEY_FILE: "",
            LOG_LEVEL: "info",
        };
        /** @type {import("mcos/shared").TServerLogger} */
        const log = {
            info: () => { return },
            error: () => { return },
        };

        const expectedClass = ShardServer;

        // act
        const server = ShardServer.getInstance(config, log);

        // assert
        expect(server).to.be.instanceOf(expectedClass);
    });

    describe("handleGetCert", () => {
        it("should return file contents", () => {
            // arrange
            /** @type {import("mcos/shared").TServerConfiguration} */
            const config = {
                CERTIFICATE_FILE: "Hello!",
                EXTERNAL_HOST: "",
                PRIVATE_KEY_FILE: "",
                PUBLIC_KEY_FILE: "",
                LOG_LEVEL: "info",
            };

            const expectedText = "Hello! I'm an SSL cert. Honest.";

            // act
            const result = handleGetCert(config);

            // assert
            expect(result).to.equal(expectedText);
        });

        it("should throw if env is not set", () => {
            // arrange
            /** @type {import("mcos/shared").TServerConfiguration} */
            const config = {
                CERTIFICATE_FILE: "",
                EXTERNAL_HOST: "",
                PRIVATE_KEY_FILE: "",
                PUBLIC_KEY_FILE: "",
                LOG_LEVEL: "info",
            };

            const expectedText = "Please set CERTIFICATE_FILE";

            // act
            expect(() => handleGetCert(config)).throws(expectedText);
        });
    });

    describe("handleGetRegistry", () => {
        it("should return file contents", () => {
            // arrange
            /** @type {import("mcos/shared").TServerConfiguration} */
            const config = {
                CERTIFICATE_FILE: "",
                EXTERNAL_HOST: "0.10.0.1",
                PRIVATE_KEY_FILE: "",
                PUBLIC_KEY_FILE: "",
                LOG_LEVEL: "info",
            };

            const expectedText = '"AuthLoginServer"="0.0.0.0"';

            // act
            const result = handleGetRegistry(config);

            // assert
            expect(result).to.contain(expectedText);
        });

        it("should throw if env is not set", () => {
            // arrange
            /** @type {import("mcos/shared").TServerConfiguration} */
            const config = {
                CERTIFICATE_FILE: "",
                EXTERNAL_HOST: "",
                PRIVATE_KEY_FILE: "",
                PUBLIC_KEY_FILE: "",
                LOG_LEVEL: "info",
            };

            const expectedText = "Please set EXTERNAL_HOST";

            // act
            expect(() => handleGetRegistry(config)).throws(expectedText);
        });
    });

    describe("handleGetKey", () => {
        it("should return file contents", () => {
            // arrange
            /** @type {import("mcos/shared").TServerConfiguration} */
            const config = {
                CERTIFICATE_FILE: "",
                EXTERNAL_HOST: "",
                PRIVATE_KEY_FILE: "",
                PUBLIC_KEY_FILE: "Public",
                LOG_LEVEL: "info",
            };

            const expectedText = "I'm a public key! Wheeeeeeeee";

            // act
            const result = handleGetKey(config);

            // assert
            expect(result).to.equal(expectedText);
        });

        it("should throw if env is not set", () => {
            // arrange
            /** @type {import("mcos/shared").TServerConfiguration} */
            const config = {
                CERTIFICATE_FILE: "",
                EXTERNAL_HOST: "",
                PRIVATE_KEY_FILE: "",
                PUBLIC_KEY_FILE: "",
                LOG_LEVEL: "info",
            };

            const expectedText = "Please set PUBLIC_KEY_FILE";

            // act
            expect(() => handleGetKey(config)).throws(expectedText);
        });
    });
});
