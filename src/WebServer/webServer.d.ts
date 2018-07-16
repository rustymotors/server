import { IConfigurationFile } from "../../config/config";
export declare class WebServer {
    start(configurationFile: IConfigurationFile): Promise<void>;
}
declare const webServer: WebServer;
export { webServer };
