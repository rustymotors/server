import type { Connection } from "../connection/src/Connection";

export class ClientConnectionManager {
    static _instance: ClientConnectionManager;
    
    static getInstance() {
        if (!ClientConnectionManager._instance) {
            ClientConnectionManager._instance = new ClientConnectionManager();
        }
        return ClientConnectionManager._instance;
    }
    private _connections: Map<string, Connection> = new Map();

    public addConnection(connection: Connection) {
        this._connections.set(connection.id, connection);
    }

    public removeConnection(connectionId: string) {
        this._connections.delete(connectionId);
    }

    public getConnection(connectionId: string): Connection | undefined {
        return this._connections.get(connectionId);
    }

    public getConnections(): Connection[] {
        return Array.from(this._connections.values());
    }

    public clearConnections() {
        this._connections.clear();
    }

    static addConnection(connection: Connection) {
        ClientConnectionManager.getInstance().addConnection(connection);
    }

    static removeConnection(connectionId: string) {
        ClientConnectionManager.getInstance().removeConnection(connectionId);
    }

    static getConnection(connectionId: string): Connection | undefined {
        return ClientConnectionManager.getInstance().getConnection(connectionId);
    }

    static getConnections(): Connection[] {
        return ClientConnectionManager.getInstance().getConnections();
    }
}
