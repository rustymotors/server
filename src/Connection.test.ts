// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Socket } from "net";
import { Connection } from "./Connection";
import ConnectionMgr from "./connectionMgr";

let testConnection1: Connection;
let testConnection2: Connection;

describe("Connection class", () => {
  beforeEach(() => {
    testConnection1 = new Connection(1, new Socket(), new ConnectionMgr());
  });

  test('status == "inactive"', () => {
    expect(testConnection1.status).toEqual("INACTIVE");
  });

  test("has no default encryption object", () => {
    expect(testConnection1.enc.in).toEqual(null);
    expect(testConnection1.enc.out).toEqual(null);
  });

  test("changes to setupComplete after setting key", () => {
    expect(testConnection1.isSetupComplete).toBeFalsy();
    testConnection1.setEncryptionKey(Buffer.from("abc123", "hex").toString("hex"));
    expect(testConnection1.isSetupComplete).toBeTruthy();
  });
  describe("Two connections can communicate", () => {
    beforeEach(() => {
      testConnection1 = new Connection(1, new Socket(), new ConnectionMgr());
      testConnection2 = new Connection(2, new Socket(), new ConnectionMgr());
    });

    test("Connection one can talk to Connection two", () => {
      testConnection1.setEncryptionKey(Buffer.from("abc123", "hex").toString("hex"));
      testConnection2.setEncryptionKey(Buffer.from("abc123", "hex").toString("hex"));
      const testString = "I'm a very a secret message. Please don't decode me!";
      if (!testConnection1.enc.in) {
        throw new Error("error in testing!");
      }
      const encipheredBuffer = testConnection1.enc.in.processString(
        Buffer.from(testString).toString("hex"),
      );
      if (!testConnection2.enc.out) {
        throw new Error("error in testing!");
      }
      expect(
        testConnection2.enc.out.processString(encipheredBuffer.toString("hex")).toString(),
      ).toEqual(testString);
    });
  });
});
