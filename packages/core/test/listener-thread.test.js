/* eslint-disable @typescript-eslint/no-unused-vars */
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const t = require("tap");
const { SocketFactory } = require("../../test-helpers/socket-factory.js");
const { ConnectionManager } = require("../src/connection-mgr.js");
const { ListenerThread } = require("../src/listener-thread.js");
const { Buffer } = require("buffer");
const { LoginServer } = require("../../login/src/index.js");
const { PersonaServer } = require("../../persona/src/index.js");
const { LobbyServer } = require("../../lobby/src/index.js");
const { MCOTServer } = require("../../transactions/src/index.js");
const { DatabaseManager } = require("../../database/src/index.js");

t.test("ListenerThread - _onData", async () => {
  const listenerThread = ListenerThread.getInstance();

  const fakeSocket1 = SocketFactory.createSocket();
  t.equal(fakeSocket1.localPort, 7003);

  const fakeConnection1 = ConnectionManager.getInstance().newConnection(
    "test_connction_1",
    fakeSocket1
  );
  fakeConnection1.remoteAddress = "0.0.0.0";

  t.equal(fakeConnection1.remoteAddress, "0.0.0.0");

  try {
    await listenerThread._onData(
      Buffer.alloc(5),
      fakeConnection1,
      ConnectionManager.getInstance(),
      LoginServer.getInstance(),
      PersonaServer.getInstance(),
      LobbyServer.getInstance(),
      MCOTServer.getInstance(),
      DatabaseManager.getInstance()
    );
  } catch (err) {
    if (err instanceof Error) {
      t.notMatch(err.message, "Remote address is empty");
    }
  }

  const fakeSocket3 = SocketFactory.createSocket();
  t.equal(fakeSocket3.localPort, 7003);

  const fakeConnection3 = (await ConnectionManager.getInstance()).newConnection(
    "test_connction_3",
    fakeSocket3
  );
  fakeConnection3.sock = SocketFactory.createSocket();
  fakeConnection3.remoteAddress = "";

  t.equal(fakeConnection3.remoteAddress, "");

  try {
    await listenerThread._onData(
      Buffer.alloc(5),
      fakeConnection3,
      ConnectionManager.getInstance(),
      LoginServer.getInstance(),
      PersonaServer.getInstance(),
      LobbyServer.getInstance(),
      MCOTServer.getInstance(),
      DatabaseManager.getInstance()
    );
  } catch (err) {
    if (err instanceof Error) {
      t.match(err.message, "Unable to locate name for opCode 0");
    }
  }
});
