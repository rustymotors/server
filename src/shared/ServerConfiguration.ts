import { readFileSync } from "node:fs";
import { getServerLogger } from "./log.js";
import { Sentry } from "./sentry.js";
import {
    ELOG_LEVEL,
    TConfiguration,
    IServerConfiguration,
} from "./interfaces.js";

/**
 * @module mcos/shared
 */
class ServerConfiguration implements IServerConfiguration {
    static _instance: ServerConfiguration;

    _serverConfig: TConfiguration;

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
        this._serverConfig = {
            EXTERNAL_HOST: externalHost,
            certificateFileContents: "",
            privateKeyContents: "",
            publicKeyContents: "",
            LOG_LEVEL: logLevel,
        };
        this.setLogLevel(logLevel);
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
            const err = new Error("Unable to read private file");
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            throw err;
        }
        try {
            this._serverConfig.publicKeyContents = readFileSync(publicKeyFile, {
                encoding: "utf8",
            });
        } catch (error) {
            Sentry.captureException(error);
            const err = new Error("Unable to read private file");
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            throw err;
        }
        log("info", "Server configuration initialized");
        ServerConfiguration._instance = this;
    }
    getConfig(): TConfiguration {
        return this._serverConfig;
    }

    setLogLevel(logLevel: ELOG_LEVEL) {
        console.log("Setting log level to", logLevel);
        this._serverConfig.LOG_LEVEL = logLevel;
    }

    getLogLevel(): ELOG_LEVEL {
        return this._serverConfig.LOG_LEVEL;
    }
}

/**
 * Configue and return a new MSOCServerConfiguration object
 * @param {string} externalHost
 * @param {string} certificateFile
 * @param {string} privateKeyFile
 * @param {string} publicKeyFile
 * @param {ELOG_LEVEL} [logLevel="INFO"]
 * @returns {TConfiguration}
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
}): TConfiguration {
    if (typeof ServerConfiguration._instance === "undefined") {
        ServerConfiguration._instance = new ServerConfiguration({
            externalHost,
            certificateFile,
            privateKeyFile,
            publicKeyFile,
            logLevel,
        });
    }
    return ServerConfiguration._instance._serverConfig;
}

export function getServerConfiguration(): IServerConfiguration {
    if (typeof ServerConfiguration._instance === "undefined") {
        const err = new Error(
            "Configuration not set. Use setServerConfiguration(externalHost, certificateFile, privateKeyFile, publicKeyFile, logLevel?)"
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }
    return ServerConfiguration._instance;
}
/**
 *  Get the server configuration
 * @returns {TConfiguration}
 */
export function getConfiguration(): TConfiguration {
    return getServerConfiguration().getConfig();
}
