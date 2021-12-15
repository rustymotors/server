"use strict";
exports.__esModule = true;
exports.PatchServer = exports.CastanetResponse = void 0;
var index_1 = require("../logger/index");
var http_1 = require("http");
// import { RoutingMesh, EServerConnectionName } from "../router";
var appconfig_1 = require("../config/appconfig");
var log = index_1.logger.child({ service: "MCOServer:Patch" });
exports.CastanetResponse = {
    body: Buffer.from("cafebeef00000000000003", "hex"),
    header: {
        type: "Content-Type",
        value: "application/octet-stream"
    }
};
var PatchServer = /** @class */ (function () {
    function PatchServer() {
        // Intentionaly empty
    }
    PatchServer.prototype.start = function () {
        if (!appconfig_1["default"].MCOS.SETTINGS.PATCH_LISTEN_HOST) {
            throw new Error("Please set MCOS__SETTINGS__PATCH_LISTEN_HOST");
        }
        var host = appconfig_1["default"].MCOS.SETTINGS.PATCH_LISTEN_HOST;
        var port = 80;
        var server = (0, http_1.createServer)();
        server.on("listening", function () {
            var listeningAddress = server.address();
            if (typeof listeningAddress !== "string" &&
                listeningAddress !== null &&
                listeningAddress.port !== undefined)
                log.info("Server is listening on port ".concat(listeningAddress.port));
        });
        server.on("request", this.handleRequest.bind(this));
        log.debug("Attempting to bind to port ".concat(port));
        server.listen(port, host);
        // // Register service with router
        // RoutingMesh.getInstance().registerServiceWithRouter(
        //   EServerConnectionName.PATCH,
        //   host,
        //   port
        // );
    };
    PatchServer.getInstance = function () {
        if (!PatchServer._instance) {
            PatchServer._instance = new PatchServer();
        }
        return PatchServer._instance;
    };
    PatchServer.prototype.handleRequest = function (request, response) {
        var responseData = exports.CastanetResponse;
        switch (request.url) {
            case "/games/EA_Seattle/MotorCity/UpdateInfo":
            case "/games/EA_Seattle/MotorCity/NPS":
            case "/games/EA_Seattle/MotorCity/MCO":
                log.debug("[PATCH] Request from ".concat(request.socket.remoteAddress, " for ").concat(request.method, " ").concat(request.url, "."));
                response.setHeader(responseData.header.type, responseData.header.value);
                response.end(responseData.body);
                break;
            default:
                response.statusCode = 404;
                response.end("");
                break;
        }
    };
    return PatchServer;
}());
exports.PatchServer = PatchServer;
