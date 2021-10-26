/* eslint-disable @typescript-eslint/no-unused-vars */
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, it, jest } from "@jest/globals";
import { SocketFactory } from "./../../test-helpers/socket-factory";
import { ConnectionManager } from "../src/connection-mgr";
import { ListenerThread } from "../src/listener-thread";

jest.mock("@mco-server/database");

it("ListenerThread - _onData", async () => {
  const listenerThread = ListenerThread.getInstance();

  const fakeSocket1 = SocketFactory.createSocket();
  expect(fakeSocket1.localPort).toEqual(7003);

  const fakeConnection1 = ConnectionManager.getInstance().newConnection(
    "test_connction_1",
    fakeSocket1
  );
  fakeConnection1.remoteAddress = "0.0.0.0";

  expect(fakeConnection1.remoteAddress).toEqual("0.0.0.0");

  try {
    await listenerThread._onData(Buffer.alloc(5), fakeConnection1);
  } catch (err) {
    const error = err as Error;
    expect(error.message).not.toEqual("Remote address is empty");
  }

  const fakeSocket3 = SocketFactory.createSocket();
  expect(fakeSocket3.localPort).toEqual(7003);

  const fakeConnection3 = ConnectionManager.getInstance().newConnection(
    "test_connction_3",
    fakeSocket3
  );
  fakeConnection3.sock = SocketFactory.createSocket();
  fakeConnection3.setManager(ConnectionManager.getInstance());
  fakeConnection3.remoteAddress = undefined;

  expect(fakeConnection3.remoteAddress).toEqual(undefined);

  try {
    await listenerThread._onData(Buffer.alloc(5), fakeConnection3);
  } catch (err) {
    const error = err as Error;
    expect(error.message).toContain("Unable to locate name for opCode 0");
  }
});
