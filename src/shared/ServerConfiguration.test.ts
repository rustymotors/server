import {
    getServerConfiguration,
    setConfiguration,
} from "./ServerConfiguration.js";
import { describe, it } from "mocha";
import { expect } from "chai";
import path from "path";

describe("ServerConfiguration", () => {
    beforeEach(() => {
        setConfiguration({
            externalHost: "localhost",
            certificateFile: path.join(process.cwd(), "data/mcouniverse.crt"),
            privateKeyFile: path.join(process.cwd(), "data/private_key.pem"),
            publicKeyFile: path.join(process.cwd(), "data/pub.key"),
            logLevel: "info",
        });
    });

    describe("getLogLevel", () => {
        it("should return the log level", () => {
            const logLevel = getServerConfiguration().getLogLevel();
            expect(logLevel).to.be.equal("info");
        });
    });

    describe("setLogLevel", () => {
        it("should set the log level", () => {
            getServerConfiguration().setLogLevel("debug");
            const logLevel = getServerConfiguration().getLogLevel();
            expect(logLevel).to.be.equal("debug");
        });
    });
});
