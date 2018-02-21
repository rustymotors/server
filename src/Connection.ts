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
import { Cipher, Decipher } from "crypto";
import { Socket } from "net";
import ConnectionMgr from "./connectionMgr";

export class Connection {
  public remoteAddress: string;
  public localPort: number;
  public sock: Socket;
  public id: number;
  public inQueue: boolean;
  public enc: {
    cipher?: Cipher,
    decipher?: Decipher
  };
  public useEncryption: boolean;
  public isSetupComplete: boolean;
  public decryptedCmd: Buffer;
  public encryptedCommand: Buffer;
  public status: string;
  private appID: number;
  private msgEvent: null;
  private lastMsg: number;
  private mgr: ConnectionMgr;

  constructor(connectionId: number, sock: Socket, mgr: ConnectionMgr) {
    this.id = connectionId;
    this.appID = 0;
    this.status = "INACTIVE";
    this.remoteAddress = sock.remoteAddress;
    this.localPort = sock.localPort;
    this.sock = sock;
    this.msgEvent = null;
    this.lastMsg = 0;
    this.useEncryption = false;
    this.enc = {};
    this.isSetupComplete = false;
    this.mgr = mgr;
    this.inQueue = true;
  }

  /**
   * setEncryptionKey
   */
  public setEncryptionKey(sessionKey: string) {
    this.enc.cipher = crypto.createCipheriv("rc4", sessionKey, "");
    this.enc.decipher = crypto.createDecipheriv("rc4", sessionKey, "");
    this.isSetupComplete = true;
  }

  /**
   * CipherBuffer
   */
  public cipherBuffer(messageBuffer: Buffer) {
    return this.enc.cipher.update(messageBuffer);
  }
  
  /**
   * DecipherBuffer
   */
  public decipherBuffer(messageBuffer: Buffer) {
    return this.enc.decipher.update(messageBuffer);
  }
}
