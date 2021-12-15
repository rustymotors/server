"use strict";
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
exports.__esModule = true;
exports.EncryptionManager = void 0;
var crypto_1 = require("crypto");
/**
 * Handles the management of the encryption and decryption
 * of the TCP connections
 * @module EncryptionMgr
 */
/**
 * @class
 * @property {string} id
 * @property {Buffer} sessionkey
 * @property {crypto.Decipher} in
 * @property {crypty.Cipher} out
 */
var EncryptionManager = /** @class */ (function () {
    /**
     *
     */
    function EncryptionManager() {
        this.id = (0, crypto_1.randomUUID)();
        this.sessionkey = Buffer.alloc(0);
        this["in"] = undefined;
        this.out = undefined;
    }
    /**
     * Set the internal sessionkey
     *
     * @param {Buffer} sessionkey
     * @return {boolean}
     */
    EncryptionManager.prototype.setEncryptionKey = function (sessionkey) {
        this.sessionkey = sessionkey;
        // File deepcode ignore InsecureCipher: RC4 is the encryption algorithum used here, file deepcode ignore HardcodedSecret: A blank IV is used here
        this["in"] = (0, crypto_1.createDecipheriv)("rc4", sessionkey, "");
        this.out = (0, crypto_1.createCipheriv)("rc4", sessionkey, "");
        return true;
    };
    /**
     * Takes cyphertext and returns plaintext
     *
     * @param {Buffer} encryptedText
     * @return {Buffer}
     * @memberof EncryptionMgr
     */
    EncryptionManager.prototype.decrypt = function (encryptedText) {
        if (this["in"] === undefined) {
            throw new Error("No decryption manager found!");
        }
        return Buffer.from(this["in"].update(encryptedText));
    };
    /**
     * Encrypt plaintext and return the ciphertext
     *
     * @param {Buffer} plainText
     * @return {Buffer}
     * @memberof EncryptionMgr
     */
    EncryptionManager.prototype.encrypt = function (plainText) {
        if (this.out === undefined) {
            throw new Error("No encryption manager found!");
        }
        return Buffer.from(this.out.update(plainText.toString(), "binary", "hex"), "hex");
    };
    /**
     *
     * @return {string}
     */
    EncryptionManager.prototype._getSessionKey = function () {
        return this.sessionkey.toString("hex");
    };
    /**
     * GetId
     *
     * @return {string}
     */
    EncryptionManager.prototype.getId = function () {
        return this.id;
    };
    return EncryptionManager;
}());
exports.EncryptionManager = EncryptionManager;
