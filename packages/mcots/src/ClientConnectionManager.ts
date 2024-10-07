// import type { Connection } from "rusty-motors-connection";

// export class ClientConnectionManager {
// 	static _instance: ClientConnectionManager;

// 	static getInstance() {
// 		if (!ClientConnectionManager._instance) {
// 			ClientConnectionManager._instance = new ClientConnectionManager();
// 		}
// 		return ClientConnectionManager._instance;
// 	}
// 	private _connections: Map<string, Connection> = new Map();

// 	public removeConnection(connectionId: string) {
// 		this._connections.delete(connectionId);
// 	}

// 	public getConnection(connectionId: string): Connection | undefined {
// 		return this._connections.get(connectionId);
// 	}

// 	public getConnections(): Connection[] {
// 		return Array.from(this._connections.values());
// 	}

// 	public clearConnections() {
// 		this._connections.clear();
// 	}

// 	static removeConnection(connectionId: string) {
// 		ClientConnectionManager.getInstance().removeConnection(connectionId);
// 	}

// 	static getConnection(connectionId: string): Connection | undefined {
// 		return ClientConnectionManager.getInstance().getConnection(connectionId);
// 	}

// }
