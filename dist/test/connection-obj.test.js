"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const net_1 = require("net");
const connection_mgr_1 = require("../src/services/MCServer/connection-mgr");
const tcpConnection_1 = require("../src/services/MCServer/tcpConnection");
globals_1.jest.mock('../src/services/MCServer/connection-mgr');
globals_1.jest.mock('net');
globals_1.it('ConnectionObj', () => {
    const testConnection = new tcpConnection_1.TCPConnection('abc', new net_1.Socket(), connection_mgr_1.ConnectionManager.getInstance());
    globals_1.expect(testConnection.status).toEqual('Inactive');
    globals_1.expect(testConnection.isSetupComplete).toBeFalsy();
    testConnection.setEncryptionKey(Buffer.from('abc123', 'hex'));
    globals_1.expect(testConnection.isSetupComplete).toBeTruthy();
});
globals_1.describe('ConnectionObj cross-comms', () => {
    /** @type {ConnectionObj} */
    let testConn1;
    /** @type {ConnectionObj} */
    let testConn2;
    globals_1.beforeEach(() => {
        testConn1 = new tcpConnection_1.TCPConnection('def', new net_1.Socket(), connection_mgr_1.ConnectionManager.getInstance());
        testConn2 = new tcpConnection_1.TCPConnection('ghi', new net_1.Socket(), connection_mgr_1.ConnectionManager.getInstance());
        testConn1.setEncryptionKey(Buffer.from('abc123', 'hex'));
        testConn2.setEncryptionKey(Buffer.from('abc123', 'hex'));
    });
    const plainText1 = Buffer.from("I'm a very a secret message. Please don't decode me!");
    const cipherText1 = Buffer.from([
        0x71, 0xf2, 0xae, 0x29, 0x91, 0x8d, 0xba, 0x3d, 0x5e, 0x6c, 0x31, 0xb0,
        0x3a, 0x58, 0x82, 0xa3, 0xdd, 0xb9, 0xec, 0x5d, 0x3e, 0x82, 0xd4, 0x4f,
        0xc0, 0xe5, 0xe5, 0x39, 0x03, 0xba, 0x1c, 0x19, 0xc4, 0x16, 0x03, 0x68,
        0xff, 0xc9, 0x6f, 0x72, 0xe4, 0x94, 0x27, 0x40, 0x46, 0x47, 0x56, 0xf0,
        0x79, 0x70, 0xbf, 0x45,
    ]);
    globals_1.it('Connection one is not the same id as connection two', () => {
        console.log(1, testConn1.enc.getId());
        console.log(2, testConn2.enc.getId());
        globals_1.expect(testConn1.enc.getId()).not.toStrictEqual(testConn2.enc.getId());
    });
    globals_1.it('Connection Two can decipher Connection One', () => {
        globals_1.expect(testConn1.enc).not.toBeNull();
        const encipheredBuffer = testConn1.enc.encrypt(plainText1);
        globals_1.expect(encipheredBuffer).toStrictEqual(cipherText1);
        globals_1.expect(testConn2.enc).not.toBeNull();
        globals_1.expect(testConn1.enc.decrypt(encipheredBuffer)).toStrictEqual(plainText1);
        globals_1.expect(testConn2.enc.decrypt(encipheredBuffer)).toStrictEqual(plainText1);
        // Try again
        const encipheredBuffer2 = testConn1.enc.encrypt(plainText1);
        globals_1.expect(testConn1.enc.decrypt(encipheredBuffer2)).toStrictEqual(plainText1);
        globals_1.expect(testConn2.enc.decrypt(encipheredBuffer2)).toStrictEqual(plainText1);
        // And again
        const encipheredBuffer3 = testConn1.enc.encrypt(plainText1);
        globals_1.expect(testConn1.enc.decrypt(encipheredBuffer3)).toStrictEqual(plainText1);
        globals_1.expect(testConn2.enc.decrypt(encipheredBuffer3)).toStrictEqual(plainText1);
    });
});
//# sourceMappingURL=connection-obj.test.js.map