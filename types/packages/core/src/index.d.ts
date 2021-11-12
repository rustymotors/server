import { IMCServer, ITCPConnection } from "../../types/src/index";
import { AppConfiguration } from "../../config/src/index";
/**
 * This class starts all the servers
 */
export declare class MCServer implements IMCServer {
    static _instance: IMCServer;
    config: AppConfiguration;
    private mgr?;
    static getInstance(): IMCServer;
    private constructor();
    clearConnectionQueue(): void;
    getConnections(): ITCPConnection[];
    /**
     * Start the HTTP, HTTPS and TCP connection listeners
     * @returns {Promise<void>}
     */
    startServers(): Promise<void>;
}
