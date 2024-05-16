import type { IConnection } from "@rustymotors/shared";

export class ClientConnectionManager {
  static _instance: ClientConnectionManager;

  static getInstance() {
    if (!ClientConnectionManager._instance) {
      ClientConnectionManager._instance = new ClientConnectionManager();
    }
    return ClientConnectionManager._instance;
  }
  private _connections: Map<string, IConnection> = new Map();

  public addConnection(connection: IConnection) {
    this._connections.set(connection.getConnectionId(), connection);
  }

  public removeConnection(connectionId: string) {
    this._connections.delete(connectionId);
  }

  public getConnection(connectionId: string): IConnection | undefined {
    return this._connections.get(connectionId);
  }

  public getConnections(): IConnection[] {
    return Array.from(this._connections.values());
  }

  public clearConnections() {
    this._connections.clear();
  }

  static addConnection(connection: IConnection) {
    ClientConnectionManager.getInstance().addConnection(connection);
  }

  static removeConnection(connectionId: string) {
    ClientConnectionManager.getInstance().removeConnection(connectionId);
  }

  static getConnection(connectionId: string): IConnection | undefined {
    return ClientConnectionManager.getInstance().getConnection(connectionId);
  }

  static getConnections(): IConnection[] {
    return ClientConnectionManager.getInstance().getConnections();
  }
}
