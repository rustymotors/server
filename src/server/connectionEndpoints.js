"use strict";
exports.__esModule = true;
exports.startSSLListener = exports.startHTTPListener = void 0;
var appconfig_1 = require("../config/appconfig");
var http_1 = require("http");
var https_1 = require("https");
var index_1 = require("../logger/index");
var httpListener_1 = require("./httpListener");
var sslListener_1 = require("./sslListener");
var fs_1 = require("fs");
var log = index_1.logger.child({ service: "http" });
function startHTTPListener() {
    var _a = appconfig_1["default"].MCOS.SETTINGS, HTTP_LISTEN_HOST = _a.HTTP_LISTEN_HOST, HTTP_EXTERNAL_HOST = _a.HTTP_EXTERNAL_HOST;
    log.debug("Attempting to start the http listener on ".concat(HTTP_LISTEN_HOST, ":80"));
    return (0, http_1.createServer)(httpListener_1.httpListener).listen(80, HTTP_LISTEN_HOST, function () {
        log.debug("http endpoint listening on ".concat(HTTP_LISTEN_HOST, ":80 is accessable on ").concat(HTTP_EXTERNAL_HOST, ":80"));
        log.info("http server is listening...");
    });
}
exports.startHTTPListener = startHTTPListener;
function _sslOptions() {
    log.debug("Reading ssl certificate...");
    var cert;
    var key;
    try {
        var _a = appconfig_1["default"].MCOS.CERTIFICATE, CERTIFICATE_FILE = _a.CERTIFICATE_FILE, PRIVATE_KEY_FILE = _a.PRIVATE_KEY_FILE;
        log.debug("Loading ".concat(CERTIFICATE_FILE, "..."));
        cert = (0, fs_1.readFileSync)(CERTIFICATE_FILE, {
            encoding: "utf-8"
        });
        log.debug("Loading ".concat(PRIVATE_KEY_FILE, "..."));
        key = (0, fs_1.readFileSync)(PRIVATE_KEY_FILE, {
            encoding: "utf-8"
        });
    }
    catch (error) {
        throw new Error("Error loading ssl configuration files: (".concat(error, "), server must quit!"));
    }
    return {
        cert: cert,
        honorCipherOrder: true,
        key: key,
        rejectUnauthorized: false
    };
}
function startSSLListener() {
    try {
        var _a = appconfig_1["default"].MCOS.SETTINGS, SSL_LISTEN_HOST_1 = _a.SSL_LISTEN_HOST, SSL_EXTERNAL_HOST_1 = _a.SSL_EXTERNAL_HOST;
        var server = (0, https_1.createServer)(_sslOptions(), sslListener_1.sslListener);
        server.on("tlsClientError", function (error) {
            log.warn("[AuthLogin] SSL Socket Client Error: ".concat(error.message));
        });
        server.listen(443, SSL_LISTEN_HOST_1, function () {
            log.debug("ssl endpoint listening on ".concat(SSL_LISTEN_HOST_1, ":443 is accessable on ").concat(SSL_EXTERNAL_HOST_1, ":443"));
            log.info("ssl server is listening...");
        });
        return server;
    }
    catch (err) {
        var error = err;
        throw new Error("".concat(error.message, ", ").concat(error.stack));
    }
}
exports.startSSLListener = startSSLListener;
