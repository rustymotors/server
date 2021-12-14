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
const listener_thread_1 = require("../src/services/MCServer/listener-thread");
class FakeSocket extends net_1.Socket {
    localPort;
    remoteAddress;
    constructor() {
        super();
        this.localPort = 7003;
        delete this.remoteAddress;
    }
}
const fakeSocket = new FakeSocket();
globals_1.it('ListenerThread - _onData', async () => {
    const listenerThread = new listener_thread_1.ListenerThread();
    const fakeConnection1 = connection_mgr_1.ConnectionManager.getInstance().newConnection('test_connction_1', fakeSocket);
    fakeConnection1.remoteAddress = '0.0.0.0';
    globals_1.expect(fakeConnection1.remoteAddress).toEqual('0.0.0.0');
    try {
        await listenerThread._onData(Buffer.alloc(5), fakeConnection1);
    }
    catch (error) {
        globals_1.expect(error.message).not.toEqual('Remote address is empty');
    }
    const fakeConnection3 = connection_mgr_1.ConnectionManager.getInstance().newConnection('test_connction_3', fakeSocket);
    fakeConnection3.sock = fakeSocket;
    fakeConnection3.mgr = connection_mgr_1.ConnectionManager.getInstance();
    fakeConnection3.remoteAddress = undefined;
    globals_1.expect(fakeConnection3.remoteAddress).toEqual(undefined);
    try {
        await listenerThread._onData(Buffer.alloc(5), fakeConnection3);
    }
    catch (error) {
        globals_1.expect(error.message).toContain('Unable to locate name for opCode 0');
    }
});
//# sourceMappingURL=listener-thread.test.js.map