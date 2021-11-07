/* eslint-disable @typescript-eslint/no-unused-vars */
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import t from "tap";
import { SocketFactory } from "./../../test-helpers/socket-factory";
import { ConnectionManager } from "../src/connection-mgr";
import { ListenerThread } from "../src/listener-thread";

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
    await listenerThread._onData(Buffer.alloc(5), fakeConnection1);
  } catch (err) {
    const error = err as Error;
    t.notMatch(error.message, "Remote address is empty");
  }

  const fakeSocket3 = SocketFactory.createSocket();
  t.equal(fakeSocket3.localPort, 7003);

  const fakeConnection3 = ConnectionManager.getInstance().newConnection(
    "test_connction_3",
    fakeSocket3
  );
  fakeConnection3.sock = SocketFactory.createSocket();
  fakeConnection3.setManager(ConnectionManager.getInstance());
  fakeConnection3.remoteAddress = "";

  t.equal(fakeConnection3.remoteAddress, "");

  try {
    await listenerThread._onData(Buffer.alloc(5), fakeConnection3);
  } catch (err) {
    const error = err as Error;
    t.match(error.message, "Unable to locate name for opCode 0");
  }
});
