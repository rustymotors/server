// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Socket } from "net";
import { Connection } from "../src/Connection";
import ConnectionMgr from "../src/services/MCServer/connectionMgr";
import { Logger } from "../src/services/shared/logger";

describe("Connection class", () => {
  let testConnection: Connection;
  beforeEach(() => {
    testConnection = new Connection(
      "abc",
      new Socket(),
      new ConnectionMgr(new Logger().getLoggers())
    );
  });

  test('status == "inactive"', () => {
    expect(testConnection.status).toEqual("INACTIVE");
  });

  test("changes to setupComplete after setting key", () => {
    expect(testConnection.isSetupComplete).toBeFalsy();
    testConnection.setEncryptionKey(Buffer.from("abc123", "hex"));
    expect(testConnection.isSetupComplete).toBeTruthy();
  });
  describe("Two connections can communicate", () => {
    let testConn1: Connection;
    let testConn2: Connection;
    const plainText1 = Buffer.from(
      "I'm a very a secret message. Please don't decode me!"
    );
    const cipherText1 = Buffer.from([
      0x71,
      0xf2,
      0xae,
      0x29,
      0x91,
      0x8d,
      0xba,
      0x3d,
      0x5e,
      0x6c,
      0x31,
      0xb0,
      0x3a,
      0x58,
      0x82,
      0xa3,
      0xdd,
      0xb9,
      0xec,
      0x5d,
      0x3e,
      0x82,
      0xd4,
      0x4f,
      0xc0,
      0xe5,
      0xe5,
      0x39,
      0x03,
      0xba,
      0x1c,
      0x19,
      0xc4,
      0x16,
      0x03,
      0x68,
      0xff,
      0xc9,
      0x6f,
      0x72,
      0xe4,
      0x94,
      0x27,
      0x40,
      0x46,
      0x47,
      0x56,
      0xf0,
      0x79,
      0x70,
      0xbf,
      0x45,
    ]);
    beforeAll(() => {
      testConn1 = new Connection(
        "def",
        new Socket(),
        new ConnectionMgr(new Logger().getLoggers())
      );
      testConn2 = new Connection(
        "ghi",
        new Socket(),
        new ConnectionMgr(new Logger().getLoggers())
      );
      testConn1.setEncryptionKey(Buffer.from("abc123", "hex"));
      testConn2.setEncryptionKey(Buffer.from("abc123", "hex"));
    });

    test("Connection one is not the same id as connection two", () => {
      expect(testConn1.enc.getId()).not.toEqual(testConn2.enc.getId());
    });

    test("Connection Two can decipher Connection One", () => {
      if (!testConn1.enc) {
        throw new Error("error in testing!");
      }
      const encipheredBuffer = testConn1.enc.encrypt(plainText1);
      expect(encipheredBuffer).toEqual(cipherText1);
      if (!testConn2.enc) {
        throw new Error("error in testing!");
      }
      expect(testConn1.enc.decrypt(encipheredBuffer)).toEqual(plainText1);
      expect(testConn2.enc.decrypt(encipheredBuffer)).toEqual(plainText1);

      // Try again
      const encipheredBuffer2 = testConn1.enc.encrypt(plainText1);
      expect(testConn1.enc.decrypt(encipheredBuffer2)).toEqual(plainText1);
      expect(testConn2.enc.decrypt(encipheredBuffer2)).toEqual(plainText1);

      // And again
      const encipheredBuffer3 = testConn1.enc.encrypt(plainText1);
      expect(testConn1.enc.decrypt(encipheredBuffer3)).toEqual(plainText1);
      expect(testConn2.enc.decrypt(encipheredBuffer3)).toEqual(plainText1);
    });
  });
});
