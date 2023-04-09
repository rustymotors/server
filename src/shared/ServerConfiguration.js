import { readFileSync } from "node:fs";
import { GetServerLogger } from "./log.js";

/**
 * @module mcos/shared
 */
class ServerConfiguration {
    /** @type {ServerConfiguration} */
    static _instance;

    /** @type {import("mcos/shared").TServerConfiguration} */
    _serverConfig;

    /**
     *
     * @param {string} externalHost
     * @param {string} certificateFile
     * @param {string} privateKeyFile
     * @param {string} publicKeyFile
     * @param {import("mcos/shared").ELOG_LEVEL} [logLevel="INFO"]
     */
    constructor(
        externalHost,
        certificateFile,
        privateKeyFile,
        publicKeyFile,
        logLevel = "info"
    ) {
        const log = GetServerLogger();
        this._serverConfig = {
            EXTERNAL_HOST: externalHost,
            certificateFileContents: "",
            privateKeyContents: "",
            publicKeyContents: "",
            LOG_LEVEL: logLevel,
        };
        try {
            this._serverConfig.certificateFileContents = readFileSync(
                certificateFile,
                { encoding: "utf8" }
            );
        } catch (error) {
            throw new Error(
                `Unable to read certificate file: ${String(error)}`
            );
        }
        try {
            this._serverConfig.privateKeyContents = readFileSync(
                privateKeyFile,
                { encoding: "utf8" }
            );
        } catch (error) {
            throw new Error(`Unable to read private file`);
        }
        try {
            this._serverConfig.publicKeyContents = readFileSync(publicKeyFile, {
                encoding: "utf8",
            });
        } catch (error) {
            throw new Error(`Unable to read private file`);
        }
        log("info", "Server configuration initialized");
        ServerConfiguration._instance = this;
    }
}

/**
 * Configue and return a new MSOCServerConfiguration object
 * @param {string} externalHost
 * @param {string} certificateFile
 * @param {string} privateKeyFile
 * @param {string} publicKeyFile
 * @param {import("mcos/shared").ELOG_LEVEL} [logLevel="INFO"]
 * @returns {import("mcos/shared").TServerConfiguration}
 */
export function setServerConfiguration(
    externalHost,
    certificateFile,
    privateKeyFile,
    publicKeyFile,
    logLevel = "info"
) {
    if (typeof ServerConfiguration._instance === "undefined") {
        ServerConfiguration._instance = new ServerConfiguration(
            externalHost,
            certificateFile,
            privateKeyFile,
            publicKeyFile,
            logLevel
        );
    }
    return ServerConfiguration._instance._serverConfig;
}

/**
 *  Get the server configuration
 * @returns {import("mcos/shared").TServerConfiguration}
 */
export function getServerConfiguration() {
    if (typeof ServerConfiguration._instance === "undefined") {
        throw new Error(
            `Configuration not set. Use setServerConfiguration(externalHost, certificateFile, privateKeyFile, publicKeyFile, logLevel?)`
        );
    }
    return ServerConfiguration._instance._serverConfig;
}
