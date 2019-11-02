// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as crypto from "crypto";
import { Socket } from "net";
import ConnectionMgr from "./connectionMgr";
import { EncryptionMgr } from "./EncryptionMgr";

export class ConnectionObj {
  public id: string;
  public appId: number;
  public sock: Socket;
  public enc: EncryptionMgr;
  public useEncryption: boolean;
  public remoteAddress: string | undefined;
  public localPort: number;
  public isSetupComplete: boolean;
  public status: "ACTIVE" | "INACTIVE";
  public encryptedCmd: Buffer;
  public encLobby: {
    cipher: crypto.Cipher | null;
    decipher: crypto.Decipher | null;
  };
  public decryptedCmd: Buffer;
  public inQueue: boolean;
  public mgr: ConnectionMgr;
  private msgEvent: null;
  private lastMsg: number;

  constructor(connectionId: string, sock: Socket, mgr: ConnectionMgr) {
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
    this.enc = new EncryptionMgr();
    this.isSetupComplete = false;
    this.mgr = mgr;
    this.inQueue = true;
    this.decryptedCmd = Buffer.alloc(0);
    this.encryptedCmd = Buffer.alloc(0);
  }

  public setEncryptionKey(key: Buffer) {
    this.isSetupComplete = this.enc.setEncryptionKey(key);
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
