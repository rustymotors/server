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
        const expectedClass = ShardServer;

        // act
        const server = ShardServer.getInstance();

        // assert
        expect(server).to.be.instanceOf(expectedClass);
    });

    describe("handleGetCert", () => {
        it("should return file contents", () => {
            // arrange
            process.env.CERTIFICATE_FILE =
                "packages/mcos-shard/test/fixtures/testCert.txt";
            const expectedText = "Hello! I'm an SSL cert. Honest.";

            // act
            const result = handleGetCert();

            // assert
            expect(result).to.equal(expectedText);
        });

        it("should throw if env is not set", () => {
            // arrange
            delete process.env.CERTIFICATE_FILE;
            const expectedText = "Please set CERTIFICATE_FILE";

            // act
            expect(() => handleGetCert()).throws(expectedText);
        });
    });

    describe("handleGetRegistry", () => {
        it("should return file contents", () => {
            // arrange
            process.env.EXTERNAL_HOST = "0.0.0.0";
            const expectedText = '"AuthLoginServer"="0.0.0.0"';

            // act
            const result = handleGetRegistry();

            // assert
            expect(result).to.contain(expectedText);
        });

        it("should throw if env is not set", () => {
            // arrange
            delete process.env.EXTERNAL_HOST;
            const expectedText = "Please set EXTERNAL_HOST";

            // act
            expect(() => handleGetRegistry()).throws(expectedText);
        });
    });

    describe("handleGetKey", () => {
        it("should return file contents", () => {
            // arrange
            process.env.PUBLIC_KEY_FILE =
                "packages/mcos-shard/test/fixtures/testKey.txt";
            const expectedText = "I'm a public key! Wheeeeeeeee";

            // act
            const result = handleGetKey();

            // assert
            expect(result).to.equal(expectedText);
        });

        it("should throw if env is not set", () => {
            // arrange
            delete process.env.PUBLIC_KEY_FILE;
            const expectedText = "Please set PUBLIC_KEY_FILE";

            // act
            expect(() => handleGetKey()).throws(expectedText);
        });
    });
});
