import { readFileSync } from "node:fs";
import { getServerLogger } from "./log.js";
import { ELOG_LEVEL, Sentry, TServerConfiguration } from "mcos/shared";

/**
 * @module mcos/shared
 */
class ServerConfiguration {
    /** @type {ServerConfiguration} */
    static _instance: ServerConfiguration;

    /** @type {TServerConfiguration} */
    _serverConfig: TServerConfiguration;

    /**
     *
     * @param {string} externalHost
     * @param {string} certificateFile
     * @param {string} privateKeyFile
     * @param {string} publicKeyFile
     * @param {ELOG_LEVEL} [logLevel="INFO"]
     */
    constructor(
        externalHost: string,
        certificateFile: string,
        privateKeyFile: string,
        publicKeyFile: string,
        logLevel: ELOG_LEVEL = "info"
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
            Sentry.captureException(error);
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
            Sentry.captureException(error);
            const err = new Error(`Unable to read private file`);
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            throw err;
        }
        try {
            this._serverConfig.publicKeyContents = readFileSync(publicKeyFile, {
                encoding: "utf8",
            });
        } catch (error) {
            Sentry.captureException(error);
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
    externalHost: string,
    certificateFile: string,
    privateKeyFile: string,
    publicKeyFile: string,
    logLevel: ELOG_LEVEL = "info"
): TServerConfiguration {
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
export function getServerConfiguration(): TServerConfiguration {
    if (typeof ServerConfiguration._instance === "undefined") {
        const err = new Error(
            `Configuration not set. Use setServerConfiguration(externalHost, certificateFile, privateKeyFile, publicKeyFile, logLevel?)`
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }
    return ServerConfiguration._instance._serverConfig;
}
