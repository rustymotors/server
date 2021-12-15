"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.NPacket = void 0;
var buffer_1 = require("buffer");
var index_1 = require("../logger/index");
var log = index_1.logger.child({ service: "npacket" });
var NPacket = /** @class */ (function () {
    function NPacket() {
        /** the connection this packet belongs to. May be blank if newly created */
        this.connectionId = "";
        /** length of the packet when serialized */
        this.length = -1;
        /** nps opcode */
        this.packetTypeId = -1;
        /** the version of the nps protocol */
        this.messageVersion = -1;
        /** the message contents */
        this.buffer = buffer_1.Buffer.alloc(0);
        /** was the packet deserilized? */
        this.wasDeserialized = false;
    }
    NPacket.deserialize = function (inputBuffer, connectionId) {
        if (connectionId === void 0) { connectionId = ""; }
        var newMessage = new NPacket();
        newMessage.connectionId = connectionId;
        newMessage.packetTypeId = inputBuffer.readInt16BE(0);
        newMessage.length = inputBuffer.readInt16BE(2);
        newMessage.messageVersion = inputBuffer.readInt16BE(4);
        // We skip index 6 and 7, this is a reserved field that is always 0
        console.log("Unknown Section: ".concat(inputBuffer.slice(8, 12).toString("hex")));
        newMessage.buffer = inputBuffer.slice(12);
        return newMessage;
    };
    NPacket.prototype.serialize = function () {
        var newPacket = buffer_1.Buffer.alloc(this.length);
        this.buffer.copy(newPacket);
    };
    NPacket.prototype.processPacket = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log.debug({ connection_id: this.getConnectionId() }, "Start processing packet");
                return [2 /*return*/];
            });
        });
    };
    NPacket.prototype.getConnectionId = function () {
        return this.connectionId;
    };
    NPacket.prototype.getJSON = function () {
        var _a = this, packetTypeId = _a.packetTypeId, length = _a.length, messageVersion = _a.messageVersion;
        return {
            packetTypeId: packetTypeId,
            length: length,
            messageVersion: messageVersion
        };
    };
    NPacket.prototype.toString = function () {
        return JSON.stringify({
            packetTypeId: this.packetTypeId,
            length: this.length,
            messageVersion: this.messageVersion
        });
    };
    return NPacket;
}());
exports.NPacket = NPacket;
