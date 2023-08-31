import { readFileSync } from "node:fs";
import { getServerLogger } from "./log.js";
import { ConfigurationServer, ServerConfiguration, ELOG_LEVEL } from "../interfaces/index.js";

/**
 * @module mcos/shared
 */
class Configuration implements ConfigurationServer {
    static instance: ConfigurationServer;

    serverConfig: ServerConfiguration;

    constructor({
        externalHost,
        certificateFile,
        privateKeyFile,
        publicKeyFile,
        logLevel = "info",
    }: {
        externalHost: string;
        certificateFile: string;
        privateKeyFile: string;
        publicKeyFile: string;
        logLevel: ELOG_LEVEL;
    }) {
        const log = getServerLogger();
        this.serverConfig = {
            EXTERNAL_HOST: externalHost,
            certificateFileContents: "",
            privateKeyContents: "",
            publicKeyContents: "",
            LOG_LEVEL: logLevel,
        };
        this.setLogLevel(logLevel);
        try {
            this.serverConfig.certificateFileContents = readFileSync(
                certificateFile,
                { encoding: "utf8" },
            );
        } catch (error) {
            const err = new Error(
                `Unable to read certificate file: ${String(error)}`,
            );
            throw err;
        }
        try {
            this.serverConfig.privateKeyContents = readFileSync(
                privateKeyFile,
                { encoding: "utf8" },
            );
        } catch (error) {
            const err = new Error("Unable to read private file");
            throw err;
        }
        try {
            this.serverConfig.publicKeyContents = readFileSync(publicKeyFile, {
                encoding: "utf8",
            });
        } catch (error) {
            const err = new Error("Unable to read private file");
            throw err;
        }
        log("info", "Server configuration initialized");
        Configuration.instance = this;
    }
    getConfig(): ServerConfiguration {
        return this.serverConfig;
    }

    setLogLevel(logLevel: ELOG_LEVEL) {
        console.log("Setting log level to", logLevel);
        this.serverConfig.LOG_LEVEL = logLevel;
    }

    getLogLevel(): ELOG_LEVEL {
        return this.serverConfig.LOG_LEVEL;
    }
}

/**
 * Configue and return a new ServerConfiguration object
 * @param {string} externalHost
 * @param {string} certificateFile
 * @param {string} privateKeyFile
 * @param {string} publicKeyFile
 * @param {ELOG_LEVEL} [logLevel="INFO"]
 * @returns {Configuration}
 */

export function setConfiguration({
    externalHost = "localhost",
    certificateFile = "",
    privateKeyFile = "",
    publicKeyFile = "",
    logLevel = "info",
}: {
    externalHost: string;
    certificateFile: string;
    privateKeyFile: string;
    publicKeyFile: string;
    logLevel: ELOG_LEVEL;
}): ServerConfiguration {
    if (typeof Configuration.instance === "undefined") {
        Configuration.instance = new Configuration({
            externalHost,
            certificateFile,
            privateKeyFile,
            publicKeyFile,
            logLevel,
        });
    }
    return Configuration.instance.serverConfig;
}

export function getServerConfiguration(): ConfigurationServer {
    if (typeof Configuration.instance === "undefined") {
        const err = new Error(
            "Configuration not set. Use setServerConfiguration(externalHost, certificateFile, privateKeyFile, publicKeyFile, logLevel?)",
        );
        throw err;
    }
    return Configuration.instance;
}
