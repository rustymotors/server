export interface IConfigurationFile {
    loggerLevel: string;
    serverConfig: {
        certFilename: string;
        ipServer: string;
        privateKeyFilename: string;
        publicKeyFilename: string;
        serverDatabase: {
            name: string;
            port: number;
        };
        serverLobby: {
            name: string;
            port: number;
        };
        serverLogin: {
            name: string;
            port: number;
        };
        serverPersona: {
            name: string;
            port: number;
        };
    };
}
export declare const config: IConfigurationFile;
