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
exports.MPacket = void 0;
var buffer_1 = require("buffer");
var index_1 = require("../logger/index");
var log = index_1.logger.child({ service: "mpacket" });
var MPacket = /** @class */ (function () {
    function MPacket() {
        /** the connection this packet belongs to. May be blank if newly created */
        this.connectionId = "";
        // /** the creator of the packet*/
        // private source = -1
        /** the user id this packet is about */
        this.userid = -1;
        /** the total size of the packet when serialized */
        this.packetSize = -1;
        /** the packet type.
         * Set to MCOT when the source or destination is the server
         * Otherwise assumed to be a packet set to this type in error
         */
        this.headerId = "";
        /** this packet's number in the processing sequence */
        this.sequenceNumber = -1;
        /** possble flags providing matadata about the packet */
        this.flags = {
            /** should this packet be conpressed when sending? */
            shouldCompress: false,
            /** the content of the buffer is ASCII text.
             * isCompressed should also be true if this is trus
             */
            isText: false,
            /** ths packet should be encrypted prior to sending */
            useEncryption: false,
            /** if set, the socket can be closed after sending */
            isLastPacket: false,
            /** this is a heartbeat packet */
            isHeartbeat: false,
            /** is this packet current compressed? */
            isCompressed: false
        };
        /** the binary contents of the packet */
        this.buffer = buffer_1.Buffer.alloc(0);
        /** has deserialize() been called? */
        this.wasDeserialized = false;
    }
    MPacket.prototype.setFlags = function (flagsByte) {
        if (flagsByte & 0x80)
            this.flags.isHeartbeat = true;
        if (flagsByte & 0x10)
            this.flags.isLastPacket = true;
        if (flagsByte & 0x08)
            this.flags.useEncryption = true;
        if (flagsByte & 0x04)
            this.flags.isText = true;
        if (flagsByte & 0x02)
            this.flags.isCompressed = true;
        if (flagsByte & 0x01)
            this.flags.shouldCompress = true;
    };
    MPacket.deserialize = function (inputBuffer, connectionId) {
        if (connectionId === void 0) { connectionId = ""; }
        var newMPacket = new MPacket();
        newMPacket.connectionId = connectionId;
        newMPacket.packetSize = inputBuffer.readUInt16LE(0);
        newMPacket.headerId = inputBuffer.toString("utf8", 2, 6);
        newMPacket.sequenceNumber = inputBuffer.readUInt16LE(6);
        newMPacket.setFlags(inputBuffer[8]);
        newMPacket.buffer = inputBuffer.slice(9);
        newMPacket.wasDeserialized = true;
        return newMPacket;
    };
    MPacket.prototype.processPacket = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log.debug({ connection_id: this.getConnectionId() }, "Start processing packet");
                return [2 /*return*/];
            });
        });
    };
    MPacket.prototype.getFlags = function () {
        return this.flags;
    };
    MPacket.prototype.getJSON = function () {
        var _a = this, packetSize = _a.packetSize, headerId = _a.headerId, sequenceNumber = _a.sequenceNumber, flags = _a.flags, wasDeserialized = _a.wasDeserialized;
        return { packetSize: packetSize, headerId: headerId, sequenceNumber: sequenceNumber, flags: flags, wasDeserialized: wasDeserialized };
    };
    MPacket.prototype.toString = function () {
        return JSON.stringify(this.getJSON());
    };
    MPacket.prototype.getConnectionId = function () {
        return this.connectionId;
    };
    MPacket.prototype.getUserId = function () {
        return this.userid;
    };
    MPacket.prototype.setUserId = function (userId) {
        this.userid = userId;
    };
    return MPacket;
}());
exports.MPacket = MPacket;
