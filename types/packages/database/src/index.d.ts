/// <reference types="node" />
import { Database } from "sqlite";
import { IDatabaseManager, SessionRecord } from "../../types/src/index";
import { AppConfiguration } from "../../config/src/index";
import { IncomingMessage, Server, ServerResponse } from "http";
export declare class DatabaseManager implements IDatabaseManager {
    static _instance: DatabaseManager;
    _config: AppConfiguration;
    _server: Server;
    changes: number;
    localDB: Database;
    static getInstance(): DatabaseManager;
    private constructor();
    handleRequest(request: IncomingMessage, response: ServerResponse): void;
    fetchSessionKeyByCustomerId(customerId: number): Promise<SessionRecord>;
    fetchSessionKeyByConnectionId(connectionId: string): Promise<SessionRecord>;
    _updateSessionKey(customerId: number, sessionkey: string, contextId: string, connectionId: string): Promise<number>;
    start(): Server;
}
