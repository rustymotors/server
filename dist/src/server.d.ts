import { IAppConfiguration } from '../config/index';
import { AdminServer } from './services/AdminServer/index';
import { MCServer } from './services/MCServer/index';
import { DatabaseManager } from './services/shared/database-manager';
/**
 * Main game server
 * @class
 * @property {config.config} config
 * @property {DatabaseManager} databaseManager
 * @property {MCServer} mcServer
 * @property {AdminServer} adminServer
 */
export declare class Server {
    config: IAppConfiguration;
    databaseManager: DatabaseManager;
    serviceName: string;
    mcServer: MCServer | undefined;
    adminServer: AdminServer | undefined;
    /**
     * @param {DatabaseManager} databaseManager
     */
    constructor(databaseManager: DatabaseManager);
    /**
     * @return {Promise<void>}
     */
    start(): Promise<void>;
}
