"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingServer = void 0;
const net_1 = __importDefault(require("net"));
const mco_types_1 = require("../mco-types");
const mco_logger_1 = require("@drazisil/mco-logger");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { log } = mco_logger_1.Logger.getInstance();
class RoutingServer {
    static _instance;
    _server;
    _serverConnections = [];
    _serviceName = 'MCOServer:Route';
    static getInstance() {
        if (!RoutingServer._instance) {
            RoutingServer._instance = new RoutingServer();
        }
        return RoutingServer._instance;
    }
    constructor() {
        this._server = net_1.default.createServer(socket => {
            socket.on('end', () => {
                const { localPort, remoteAddress, remotePort } = socket;
                log('debug', `Service ${remoteAddress}:${remotePort} disconnected from port ${localPort}`, {
                    service: this._serviceName,
                });
            });
            socket.on('data', data => {
                this._handleData(data);
            });
            socket.on('error', error => {
                if (!error.message.includes('ECONNRESET')) {
                    throw new Error(`Socket error: ${error}`);
                }
            });
        });
    }
    _handleData(data) {
        const payload = data.toString();
        log('debug', `Payload: ${payload}`, {
            service: this._serviceName,
        });
        let payloadJSON;
        try {
            payloadJSON = JSON.parse(payload);
        }
        catch (error) {
            log('error', `Error pasing payload!: ${error}`, {
                service: this._serviceName,
            });
            return;
        }
        const { action } = payloadJSON;
        if (action === mco_types_1.EServerConnectionAction.REGISTER_SERVICE) {
            return this._registerNewService(payloadJSON);
        }
        else {
            throw new Error('Method not implemented.');
        }
    }
    _registerNewService(payloadJSON) {
        const { service, host, port } = payloadJSON;
        if (service && host && port) {
            const newService = {
                service,
                host,
                port,
            };
            this._serverConnections.push(newService);
            log('debug', `Registered new service: ${JSON.stringify(newService)}`, {
                service: this._serviceName,
            });
            return;
        }
        log('error', `There was an error adding server connection: ${payloadJSON}`, {
            service: this._serviceName,
        });
    }
    async start() {
        const port = 4242;
        this._server.listen(port, '0.0.0.0', () => {
            log('info', `RoutingServer listening on port ${port}`, {
                service: this._serviceName,
            });
        });
        return this._server;
    }
}
exports.RoutingServer = RoutingServer;
//# sourceMappingURL=index.js.map