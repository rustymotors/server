"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionManager = void 0;
const mco_logger_1 = require("@drazisil/mco-logger");
const structures_1 = require("../../structures");
const message_node_1 = require("../MCOTS/message-node");
const tcp_manager_1 = require("../MCOTS/tcp-manager");
const database_manager_1 = require("../shared/database-manager");
const nps_packet_manager_1 = require("./nps-packet-manager");
const tcpConnection_1 = require("./tcpConnection");
const { log } = mco_logger_1.Logger.getInstance();
class ConnectionManager {
    static _instance;
    databaseMgr = database_manager_1.DatabaseManager.getInstance();
    connections;
    newConnectionId;
    banList;
    serviceName;
    static getInstance() {
        if (!ConnectionManager._instance) {
            ConnectionManager._instance = new ConnectionManager();
        }
        return ConnectionManager._instance;
    }
    constructor() {
        this.databaseMgr = database_manager_1.DatabaseManager.getInstance();
        /**
         * @type {module:ConnectionObj[]}
         */
        this.connections = [];
        this.newConnectionId = 1;
        /**
         * @type {string[]}
         */
        this.banList = [];
        this.serviceName = 'mcoserver:ConnectionMgr';
    }
    newConnection(connectionId, socket) {
        return new tcpConnection_1.TCPConnection(connectionId, socket, ConnectionManager.getInstance());
    }
    /**
     * Check incoming data and route it to the correct handler based on localPort
     * @param {IRawPacket} rawPacket
     * @return {Promise} {@link module:ConnectionObj~ConnectionObj}
     */
    async processData(rawPacket) {
        const npsPacketManager = new nps_packet_manager_1.NPSPacketManager();
        const { remoteAddress, localPort, data } = rawPacket;
        // Log the packet as debug
        log('debug', `logging raw packet,
      ${JSON.stringify({
            remoteAddress,
            localPort,
            data: data.toString('hex'),
        })}`, { service: this.serviceName });
        switch (localPort) {
            case 8226:
            case 8228:
            case 7003: {
                log('debug', `Recieved NPS packet,
          ${JSON.stringify({
                    opCode: rawPacket.data.readInt16BE(0),
                    msgName1: npsPacketManager.msgCodetoName(rawPacket.data.readInt16BE(0)),
                    msgName2: this.getNameFromOpCode(rawPacket.data.readInt16BE(0)),
                    localPort,
                })}`, { service: this.serviceName });
                try {
                    return await npsPacketManager.processNPSPacket(rawPacket);
                }
                catch (error) {
                    throw new Error(`Error in connectionMgr::processData ${error}`);
                }
            }
            case 43_300: {
                log('debug', 'Recieved MCOTS packet', { service: this.serviceName });
                const newNode = new message_node_1.MessageNode(message_node_1.EMessageDirection.RECEIVED);
                newNode.deserialize(rawPacket.data);
                log('debug', JSON.stringify(newNode), { service: this.serviceName });
                return tcp_manager_1.defaultHandler(rawPacket);
            }
            default:
                log('debug', JSON.stringify(rawPacket), { service: this.serviceName });
                throw new Error(`We received a packet on port ${localPort}. We don't what to do yet, going to throw so the message isn't lost.`);
        }
    }
    /**
     * Get the name connected to the NPS opcode
     * @param {number} opCode
     * @return {string}
     */
    getNameFromOpCode(opCode) {
        const opCodeName = structures_1.NPS_COMMANDS.find(code => code.value === opCode);
        if (opCodeName === undefined) {
            throw new Error(`Unable to locate name for opCode ${opCode}`);
        }
        return opCodeName.name;
    }
    /**
     * Get the name connected to the NPS opcode
     * @param {string} name
     * @return {number}
     */
    getOpcodeFromName(name) {
        const opCode = structures_1.NPS_COMMANDS.find(code => code.name === name);
        if (opCode === undefined) {
            throw new Error(`Unable to locate opcode for name ${name}`);
        }
        return opCode.value;
    }
    /**
     *
     * @return {string[]}
     */
    getBans() {
        return this.banList;
    }
    /**
     * Locate connection by remoteAddress and localPort in the connections array
     * @param {string} remoteAddress
     * @param {number} localPort
     * @memberof ConnectionMgr
     * @return {module:ConnectionObj}
     */
    findConnectionByAddressAndPort(remoteAddress, localPort) {
        return this.connections.find(connection => {
            const match = remoteAddress === connection.remoteAddress &&
                localPort === connection.localPort;
            return match;
        });
    }
    /**
     * Locate connection by id in the connections array
     * @param {string} connectionId
     * @return {module:ConnectionObj}
     */
    findConnectionById(connectionId) {
        const results = this.connections.find(connection => connectionId === connection.id);
        if (results === undefined) {
            throw new Error(`Unable to locate connection for id ${connectionId}`);
        }
        return results;
    }
    /**
     *
     * @param {string} address
     * @param {number} port
     * @param {module:ConnectionObj} newConnection
     * @return {Promise<void>}
     */
    async _updateConnectionByAddressAndPort(address, port, newConnection) {
        if (newConnection === undefined) {
            throw new Error(`Undefined connection: ${JSON.stringify({
                remoteAddress: address,
                localPort: port,
            })}`);
        }
        try {
            const index = this.connections.findIndex(connection => connection.remoteAddress === address && connection.localPort === port);
            this.connections.splice(index, 1);
            this.connections.push(newConnection);
        }
        catch (error) {
            process.exitCode = -1;
            throw new Error(`Error updating connection, ${JSON.stringify({
                error,
                connections: this.connections,
            })}`);
        }
    }
    /**
     * Return an existing connection, or a new one
     *
     * @param {module:net.Socket} socket
     * @return {module:ConnectionObj}
     */
    findOrNewConnection(socket) {
        const { remoteAddress, localPort } = socket;
        if (!remoteAddress) {
            throw new Error(`No address in socket: ${JSON.stringify({
                remoteAddress,
                localPort,
            })}`);
        }
        const con = this.findConnectionByAddressAndPort(remoteAddress, localPort);
        if (con !== undefined) {
            log('info', `[connectionMgr] I have seen connections from ${remoteAddress} on ${localPort} before`, { service: this.serviceName });
            con.sock = socket;
            return con;
        }
        const newConnection = this.newConnection(`${Date.now().toString()}_${this.newConnectionId}`, socket);
        log('info', `[connectionMgr] I have not seen connections from ${remoteAddress} on ${localPort} before, adding it.`, { service: this.serviceName });
        this.connections.push(newConnection);
        return newConnection;
    }
    /**
     *
     * @return {void}
     */
    resetAllQueueState() {
        this.connections = this.connections.map(connection => {
            connection.inQueue = true;
            return connection;
        });
    }
    /**
     * Dump all connections for debugging
     *
     * @return {module:ConnectionObj[]}
     */
    dumpConnections() {
        return this.connections;
    }
}
exports.ConnectionManager = ConnectionManager;
//# sourceMappingURL=connection-mgr.js.map