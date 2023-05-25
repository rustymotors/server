import { readFileSync } from "node:fs";
import { getServerLogger } from "./logger.js";
import { Sentry } from "mcos/shared";

/**
 * @module mcos-shared
 */
class ServerConfiguration {
    /** @type {ServerConfiguration} */
    static _instance;

    /** @type {TServerConfiguration} */
    _serverConfig;

    /**
     *
     * @param {string} externalHost
     * @param {string} certificateFile
     * @param {string} privateKeyFile
     * @param {string} publicKeyFile
     * @param {ELOG_LEVEL} [logLevel="INFO"]
     */
    constructor(
        externalHost,
        certificateFile,
        privateKeyFile,
        publicKeyFile,
        logLevel = "info"
    ) {
        const log = getServerLogger();
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
            const err = new Error(
                `Unable to read certificate file: ${String(error)}`
            );
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            throw err;
        }
        try {
            this._serverConfig.privateKeyContents = readFileSync(
                privateKeyFile,
                { encoding: "utf8" }
            );
        } catch (error) {
            const err = new Error(`Unable to read private file`);
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            throw err;
        }
        try {
            this._serverConfig.publicKeyContents = readFileSync(publicKeyFile, {
                encoding: "utf8",
            });
        } catch (error) {
            const err = new Error(`Unable to read private file`);
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            throw err;
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
 * @param {ELOG_LEVEL} [logLevel="INFO"]
 * @returns {TServerConfiguration}
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
 * @returns {TServerConfiguration}
 */
export function getServerConfiguration() {
    if (typeof ServerConfiguration._instance === "undefined") {
        const err = new Error(
            `Configuration not set. Use setServerConfiguration(externalHost, certificateFile, privateKeyFile, publicKeyFile, logLevel?)`
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }
    return ServerConfiguration._instance._serverConfig;
}
