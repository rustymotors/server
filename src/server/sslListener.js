"use strict";
exports.__esModule = true;
exports.sslListener = void 0;
var auth_1 = require("../auth");
var admin_1 = require("../admin");
var logger_1 = require("../logger");
var log = logger_1.logger.child({ service: "ssl" });
function sslListener(req, res) {
    if (req.url && req.url.startsWith("/AuthLogin")) {
        log.debug("ssl routing request to login web server");
        return auth_1.AuthLogin.getInstance().handleRequest(req, res);
    }
    if (req.url &&
        (req.url === "/admin/connections" ||
            req.url === "/admin/connections/resetAllQueueState" ||
            req.url.startsWith("/admin"))) {
        log.debug("ssl routing request to admin web server");
        return admin_1.AdminServer.getInstance().handleRequest(req, res);
    }
    log.warn("Unexpected request for ".concat(req.url, " from ").concat(req.socket.remoteAddress, ", skipping."));
    res.statusCode = 404;
    res.end("Not found");
}
exports.sslListener = sslListener;
