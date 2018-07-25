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

const crypto = require('crypto');
const { RC4 } = require('./RC4');

class Connection {
  constructor(connectionId, sock, mgr) {
    this.id = connectionId;
    this.appID = 0;
    this.status = 'INACTIVE';
    this.remoteAddress = sock.remoteAddress;
    this.localPort = sock.localPort;
    this.sock = sock;
    this.msgEvent = null;
    this.lastMsg = 0;
    this.useEncryption = false;
    this.encLobby = {};
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
  setEncryptionKey(sessionKey) {
    this.enc.in = new RC4(sessionKey);
    this.enc.out = new RC4(sessionKey);

    this.isSetupComplete = true;
  }

  /**
   * setEncryptionKeyDES
   */
  setEncryptionKeyDES(sKey) {
    const desIV = Buffer.alloc(8);
    this.encLobby.cipher = crypto.createCipheriv(
      'des-cbc',
      Buffer.from(sKey, 'hex'),
      desIV,
    );
    this.encLobby.cipher.setAutoPadding(false);
    this.encLobby.decipher = crypto.createDecipheriv(
      'des-cbc',
      Buffer.from(sKey, 'hex'),
      desIV,
    );
    this.encLobby.decipher.setAutoPadding(false);

    this.isSetupComplete = true;
  }

  /**
   * CipherBufferDES
   */
  cipherBufferDES(messageBuffer) {
    return this.encLobby.cipher.update(messageBuffer);
  }

  /**
   * DecipherBufferDES
   */
  decipherBufferDES(messageBuffer) {
    return this.encLobby.decipher.update(messageBuffer);
  }
}

module.exports = { Connection };
