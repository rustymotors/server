"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingMesh = void 0;
const mco_logger_1 = require("@drazisil/mco-logger");
const net_1 = __importDefault(require("net"));
const mco_types_1 = require("../mco-types");
const { log } = mco_logger_1.Logger.getInstance();
class RoutingMesh {
    static getInstance() {
        return new RoutingMesh();
    }
    constructor() {
        // Inrnetionally empty
    }
    registerServiceWithRouter(service, host, port) {
        const payload = {
            action: mco_types_1.EServerConnectionAction.REGISTER_SERVICE,
            service,
            host,
            port,
        };
        const payloadBuffer = Buffer.from(JSON.stringify(payload));
        this._sendToRouter(service, payloadBuffer);
    }
    _sendToRouter(service, inputBuffer) {
        const client = net_1.default.createConnection({ port: 4242 }, () => {
            // 'connect' listener.
            log('debug', 'Connected to RoutingServer', {
                service,
            });
            client.end(inputBuffer);
        });
        client.on('data', data => {
            console.log(data.toString());
            client.end();
        });
        client.on('end', () => {
            log('info', 'disconnected from RoutingServer', {
                service,
            });
        });
    }
}
exports.RoutingMesh = RoutingMesh;
//# sourceMappingURL=index.js.map