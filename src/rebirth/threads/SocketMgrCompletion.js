import { SubThread } from "./SubThread.js";
import { createServer } from "node:net";
import { INITIAL_CONNECTIONS, MC_DB_CLIENT_PORT, MC_LOBBY_PORT, MC_LOGIN_PORT, MC_PERSONA_PORT } from "../../../mcServer.js";
import { Connection } from "../../../Connection.js";


export class SocketMgrCompletion extends SubThread {
    constructor() {
        super("SocketMgrCompletion");
        this.connectedClients = [];
        this.connectionID = 0;
    }

    init() {
        super.init();
        /** @type {import("node:net").Server} */
        this.loginServer = createServer(this.onSocketConnection.bind(this));
        this.loginServer.listen(MC_LOGIN_PORT, "0.0.0.0", INITIAL_CONNECTIONS);
        console.log(`SocketMgrCompletion listening on port ${MC_DB_CLIENT_PORT}`);

        this.personaServer = createServer(this.onSocketConnection.bind(this));
        this.personaServer.listen(MC_PERSONA_PORT, "0.0.0.0", INITIAL_CONNECTIONS);
        console.log(`SocketMgrCompletion listening on port ${MC_PERSONA_PORT}`);

        this.lobbyServer = createServer(this.onSocketConnection.bind(this));
        this.lobbyServer.listen(MC_LOBBY_PORT, "0.0.0.0", INITIAL_CONNECTIONS);
        console.log(`SocketMgrCompletion listening on port ${MC_LOBBY_PORT}`);

        this.dbServer = createServer(this.onSocketConnection.bind(this));
        this.dbServer.listen(MC_DB_CLIENT_PORT, "0.0.0.0", INITIAL_CONNECTIONS);
        console.log(`SocketMgrCompletion listening on port ${MC_DB_CLIENT_PORT}`);
    }

    /**
     * 
     * @param {import("node:net").Socket} socket 
     */
    onSocketConnection(socket) {
        console.log(`SocketMgrCompletion.onConnection() socket.remoteAddress: ${socket.remoteAddress}, socket.remotePort: ${socket.remotePort}`);
        const con = new Connection();
        con.id = this.connectionID++;
        if (typeof socket.remoteAddress != "string") {
            console.log(`SocketMgrCompletion.onConnection() socket.remoteAddress is not a string.`);
            return;            
        }
        con.ip = socket.remoteAddress;
        console.log(`SocketMgrCompletion.onConnection() con.id: ${con.id}, con.ip: ${con.ip}`);

        con.status = Connection.ACTIVE;
        con.socket = socket;
        if (typeof socket.localPort != "number") {
            console.log(`SocketMgrCompletion.onConnection() socket.localPort is not a number.`);
            return;            
        }
        con.port = socket.localPort




    }

    shutdown() {
        if (typeof this.loginServer !== "undefined") {
            this.loginServer.close();
        }
        super.shutdown();
    }
}


