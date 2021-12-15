"use strict";
exports.__esModule = true;
exports.httpListener = void 0;
var logger_1 = require("../logger");
var patch_1 = require("../patch");
var shard_1 = require("../shard");
var log = logger_1.logger.child({ service: "http" });
function httpListener(req, res) {
    if (req.url === "/games/EA_Seattle/MotorCity/UpdateInfo" ||
        req.url === "/games/EA_Seattle/MotorCity/NPS" ||
        req.url === "/games/EA_Seattle/MotorCity/MCO") {
        log.debug("http routing request to patch server");
        return patch_1.PatchServer.getInstance().handleRequest(req, res);
    }
    if (req.url === "/cert" ||
        req.url === "/key" ||
        req.url === "/registry" ||
        req.url === "/ShardList/") {
        log.debug("http routing request to shard server");
        return shard_1.ShardServer.getInstance()._handleRequest(req, res);
    }
    log.warn("Unexpected request for ".concat(req.url, " from ").concat(req.socket.remoteAddress, ", skipping."));
    res.statusCode = 404;
    res.end("Not found");
}
exports.httpListener = httpListener;
