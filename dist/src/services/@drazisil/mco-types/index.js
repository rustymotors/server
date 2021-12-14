"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EServiceQuery = exports.EServerConnectionAction = exports.EServerConnectionName = void 0;
var EServerConnectionName;
(function (EServerConnectionName) {
    EServerConnectionName["ADMIN"] = "Admin";
    EServerConnectionName["AUTH"] = "Auth";
    EServerConnectionName["MCSERVER"] = "MCServer";
    EServerConnectionName["PATCH"] = "Patch";
    EServerConnectionName["PROXY"] = "Proxy";
    EServerConnectionName["SHARD"] = "Shard";
})(EServerConnectionName = exports.EServerConnectionName || (exports.EServerConnectionName = {}));
var EServerConnectionAction;
(function (EServerConnectionAction) {
    EServerConnectionAction["REGISTER_SERVICE"] = "Register Service";
})(EServerConnectionAction = exports.EServerConnectionAction || (exports.EServerConnectionAction = {}));
var EServiceQuery;
(function (EServiceQuery) {
    EServiceQuery["GET_CONNECTIONS"] = "Get connections";
})(EServiceQuery = exports.EServiceQuery || (exports.EServiceQuery = {}));
//# sourceMappingURL=index.js.map