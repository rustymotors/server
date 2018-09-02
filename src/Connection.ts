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

import * as crypto from "crypto";
import { Socket } from "net";
import ConnectionMgr from "./connectionMgr";
import RC4 from "./RC4";

export class Connection {
  public id: number;
  public appId: number;
  public sock: Socket;
  public enc: {
    in: RC4 | null;
    out: RC4 | null;
  };
  public useEncryption: boolean;
  public remoteAddress: string | undefined;
  public localPort: number;
  public isSetupComplete: boolean;
  public status: "ACTIVE" | "INACTIVE";
  public encryptedCommand: Buffer;
  public encLobby: {
    cipher: crypto.Cipher | null;
    decipher: crypto.Decipher | null;
  };
  public decryptedCmd: Buffer;
  public inQueue: boolean;
  public mgr: ConnectionMgr;
  private msgEvent: null;
  private lastMsg: number;

  constructor(connectionId: number, sock: Socket, mgr: ConnectionMgr) {
    this.id = connectionId;
    this.appId = 0;
    this.status = "INACTIVE";
    this.remoteAddress = sock.remoteAddress;
    this.localPort = sock.localPort;
    this.sock = sock;
    this.msgEvent = null;
    this.lastMsg = 0;
    this.useEncryption = false;
    this.encLobby = {
      cipher: null,
      decipher: null,
    };
    this.enc = {
      in: null,
      out: null,
    };
    this.isSetupComplete = false;
    this.mgr = mgr;
    this.inQueue = true;
  }

  /**
   * setEncryptionKey
   */
  public setEncryptionKey(sessionKey: string) {
    this.enc.in = new RC4(sessionKey);
    this.enc.out = new RC4(sessionKey);

    this.isSetupComplete = true;
  }

  /**
   * setEncryptionKeyDES
   */
  public setEncryptionKeyDES(sKey: string) {
    const desIV = Buffer.alloc(8);
    this.encLobby.cipher = crypto.createCipheriv(
      "des-cbc",
      Buffer.from(sKey, "hex"),
      desIV
    );
    this.encLobby.cipher.setAutoPadding(false);
    this.encLobby.decipher = crypto.createDecipheriv(
      "des-cbc",
      Buffer.from(sKey, "hex"),
      desIV
    );
    this.encLobby.decipher.setAutoPadding(false);

    this.isSetupComplete = true;
  }

  /**
   * CipherBufferDES
   */
  public cipherBufferDES(messageBuffer: Buffer) {
    if (this.encLobby.cipher) {
      return this.encLobby.cipher.update(messageBuffer);
    }
    throw new Error("No DES cipher set on connection");
  }

  /**
   * DecipherBufferDES
   */
  public decipherBufferDES(messageBuffer: Buffer) {
    if (this.encLobby.decipher) {
      return this.encLobby.decipher.update(messageBuffer);
    }
    throw new Error("No DES decipher set on connection");
  }
}

module.exports = { Connection };
