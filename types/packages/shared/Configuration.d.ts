import { Logger } from "pino";
export declare class Configuration {
    static instance: Configuration;
    host: string;
    certificateFile: string;
    privateKeyFile: string;
    publicKeyFile: string;
    logLevel: string;
    constructor({ host, certificateFile, privateKeyFile, publicKeyFile, logLevel, logger, }: {
        host?: string;
        certificateFile?: string;
        privateKeyFile?: string;
        publicKeyFile?: string;
        logLevel?: string;
        logger?: Logger;
    });
}
export declare function getServerConfiguration({ host, certificateFile, privateKeyFile, publicKeyFile, logLevel, logger, }: {
    host?: string;
    certificateFile?: string;
    privateKeyFile?: string;
    publicKeyFile?: string;
    logLevel?: string;
    logger?: Logger;
}): Configuration;
//# sourceMappingURL=Configuration.d.ts.map