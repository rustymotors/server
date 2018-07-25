import { IConfigurationFile } from "../../config/config";
export default class PatchServer {
    start(configurationFile: IConfigurationFile): Promise<void>;
}
declare const patchServer: PatchServer;
export { patchServer };
