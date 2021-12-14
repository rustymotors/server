"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatchServer = exports.CastanetResponse = void 0;
const http_1 = __importDefault(require("http"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const server_config_1 = __importDefault(require("./server.config"));
const mco_logger_1 = require("@drazisil/mco-logger");
const mco_types_1 = require("../mco-types");
const mco_common_1 = require("../mco-common");
const { log } = mco_logger_1.Logger.getInstance();
exports.CastanetResponse = {
    body: Buffer.from('cafebeef00000000000003', 'hex'),
    header: {
        type: 'Content-Type',
        value: 'application/octet-stream',
    },
};
class PatchServer {
    static _instance;
    _config;
    _server;
    _serviceName = 'MCOServer:Patch';
    static getInstance() {
        if (!PatchServer._instance) {
            PatchServer._instance = new PatchServer();
        }
        return PatchServer._instance;
    }
    constructor() {
        this._config = server_config_1.default;
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
        const responseData = exports.CastanetResponse;
        switch (request.url) {
            case '/games/EA_Seattle/MotorCity/UpdateInfo':
            case '/games/EA_Seattle/MotorCity/NPS':
            case '/games/EA_Seattle/MotorCity/MCO':
                log('debug', `[PATCH] Request from ${request.socket.remoteAddress} for ${request.method} ${request.url}.`, { service: this._serviceName });
                response.setHeader(responseData.header.type, responseData.header.value);
                response.end(responseData.body);
                break;
            default:
                response.statusCode = 404;
                response.end('');
                break;
        }
    }
    start() {
        const host = server_config_1.default.serverSettings.host || 'localhost';
        const port = 81;
        return this._server.listen({ port, host }, () => {
            log('debug', `port ${port} listening`, { service: this._serviceName });
            log('info', 'Patch server is listening...', {
                service: this._serviceName,
            });
            // Register service with router
            mco_common_1.RoutingMesh.getInstance().registerServiceWithRouter(mco_types_1.EServerConnectionName.PATCH, host, port);
        });
    }
}
exports.PatchServer = PatchServer;
//# sourceMappingURL=index.js.map