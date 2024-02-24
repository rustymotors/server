"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.z = exports.createSqlTag = exports.sql = exports.slonik = void 0;
var slonik_1 = require("slonik");
exports.slonik = await (0, slonik_1.createPool)(
    "postgres://user:password@localhost:5432/rm",
);
var slonik_2 = require("slonik");
Object.defineProperty(exports, "sql", {
    enumerable: true,
    get: function () {
        return slonik_2.sql;
    },
});
Object.defineProperty(exports, "createSqlTag", {
    enumerable: true,
    get: function () {
        return slonik_2.createSqlTag;
    },
});
var zod_1 = require("zod");
Object.defineProperty(exports, "z", {
    enumerable: true,
    get: function () {
        return zod_1.z;
    },
});
