import { readFileSync } from "node:fs";
import { getServerLogger } from "./log.js";
import { Logger } from "pino";

export class Configuration {
    static instance: Configuration;

        host = "localhost"
        certificateFile = "certificates/certificate.pem";
        privateKeyFile =  "certificates/privatekey.pem";
        publicKeyFile = "certificates/publickey.pem";
        logLevel: string;

    constructor({
        host = "localhost",
        certificateFile = "certificates/certificate.pem",
        privateKeyFile = "certificates/privatekey.pem",
        publicKeyFile = "certificates/publickey.pem",
        logLevel = "info",
        logger = getServerLogger({}),
    }: {
        host?: string;
        certificateFile?: string;
        privateKeyFile?: string;
        publicKeyFile?: string;
        logLevel?: string;
        logger?: Logger;
    }) {
        try {
            this.certificateFile = readFileSync(certificateFile, {
                encoding: "utf8",
            });

            this.privateKeyFile = readFileSync(privateKeyFile, {
                encoding: "utf8",
            });

            this.publicKeyFile = readFileSync(publicKeyFile, {
                encoding: "utf8",
            });

            this.host = host;

            this.logLevel = logLevel;
            
        } catch (error) {
            logger.fatal(`Error in core server: ${String(error)}`);
            process.exit(1);
        }                
    }
}


export function getServerConfiguration({
    host,
    certificateFile,
    privateKeyFile,
    publicKeyFile,
    logLevel,
    logger,
}: {
    host?: string;
    certificateFile?: string;
    privateKeyFile?: string;
    publicKeyFile?: string;
    logLevel?: string;
    logger?: Logger;
}): Configuration {
    if (typeof Configuration.instance === "undefined") {
        Configuration.instance = new Configuration({
            host,
            certificateFile,
            privateKeyFile,
            publicKeyFile,
            logLevel,
            logger,
        });
    }

    return Configuration.instance;
}
