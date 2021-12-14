import { IAppConfiguration } from '../../../config/index';
import { ConnectionManager } from './connection-mgr';
/**
 * This class starts all the servers
 * TODO: Better document this
 * @module MCServer
 */
/**
 * @class
 * @property {config.config} config
 * @property {ConnectionMgr} mgr
 */
export declare class MCServer {
    static _instance: MCServer;
    config: IAppConfiguration;
    mgr: ConnectionManager;
    serviceName: string;
    static getInstance(): MCServer;
    private constructor();
    /**
     * Start the HTTP, HTTPS and TCP connection listeners
     * @returns {Promise<void>}
     */
    startServers(): Promise<void>;
}
