/// <reference types="node" />
import { _sslOptions } from "./ssl-options";
export declare type AppConfiguration = {
    certificate: {
        privateKeyFilename: string;
        publicKeyFilename: string;
        certFilename: string;
    };
    serverSettings: {
        ipServer: string;
    };
    serviceConnections: {
        databaseURL: string;
    };
    defaultLogLevel: string;
};
export declare class ConfigurationManager {
    getConfig(): AppConfiguration;
    static _instance: ConfigurationManager;
    static getInstance(): ConfigurationManager;
    private constructor();
    handleData(this: ConfigurationManager, data: Buffer): void;
}
export { _sslOptions };
