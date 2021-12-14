"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPProxyServer = void 0;
const http_1 = __importDefault(require("http"));
const mco_logger_1 = require("@drazisil/mco-logger");
const mco_types_1 = require("../mco-types");
const mco_common_1 = require("../mco-common");
const mco_shard_1 = require("../mco-shard");
const mco_patch_1 = require("../mco-patch");
const { log } = mco_logger_1.Logger.getInstance();
class HTTPProxyServer {
    static _instance;
    _server;
    _serviceName = 'MCOServer:HTTPProxy';
    static getInstance() {
        if (!HTTPProxyServer._instance) {
            HTTPProxyServer._instance = new HTTPProxyServer();
        }
        return HTTPProxyServer._instance;
    }
    constructor() {
        this._server = http_1.default.createServer((request, response) => {
            this.handleRequest(request, response);
        });
        this._server.on('error', error => {
            process.exitCode = -1;
            log('error', `Server error: ${error.message}`, {
                service: this._serviceName,
            });
            log('info', `Server shutdown: ${process.exitCode}`, {
                service: this._serviceName,
            });
            process.exit();
        });
    }
    handleRequest(request, response) {
        log('debug', `Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`, { service: this._serviceName });
        switch (request.url) {
            case '/games/EA_Seattle/MotorCity/UpdateInfo':
            case '/games/EA_Seattle/MotorCity/NPS':
            case '/games/EA_Seattle/MotorCity/MCO':
                return mco_patch_1.PatchServer.getInstance().handleRequest(request, response);
            default:
                return mco_shard_1.ShardServer.getInstance()._handleRequest(request, response);
        }
    }
    start() {
        const host = '0.0.0.0';
        const port = 80;
        return this._server.listen({ port, host }, () => {
            log('debug', `port ${port} listening`, { service: this._serviceName });
            log('info', 'Proxy server is listening...', {
                service: this._serviceName,
            });
            // Register service with router
            mco_common_1.RoutingMesh.getInstance().registerServiceWithRouter(mco_types_1.EServerConnectionName.PROXY, host, port);
        });
    }
}
exports.HTTPProxyServer = HTTPProxyServer;
//# sourceMappingURL=index.js.map