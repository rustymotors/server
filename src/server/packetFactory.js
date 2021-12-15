"use strict";
exports.__esModule = true;
exports.wrapPacket = void 0;
var mpacket_1 = require("./mpacket");
var npacket_1 = require("./npacket");
function wrapPacket(packet, packetClass) {
    if (packetClass === "tomc") {
        return mpacket_1.MPacket.deserialize(packet.data);
    }
    return npacket_1.NPacket.deserialize(packet.data);
}
exports.wrapPacket = wrapPacket;
