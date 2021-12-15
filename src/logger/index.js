"use strict";
exports.__esModule = true;
exports.logger = void 0;
var pino_1 = require("pino");
var appconfig_1 = require("../config/appconfig");
var logger = (0, pino_1["default"])({
    level: appconfig_1["default"].MCOS.SETTINGS.LOG_LEVEL || "info",
    name: "mcos"
});
exports.logger = logger;
