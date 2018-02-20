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

// This is a subset of https://github.com/certsimple/ssl-config

import { SSL_OP_NO_SSLv3 } from 'constants'

export default class OldSSLCiphers {

  public ciphers: string;
  public minimumTLSVersion: number;

  private cipherSuites: string[];

  constructor() {

    this.cipherSuites = [
      "ECDHE-ECDSA-CHACHA20-POLY1305",
      "ECDHE-RSA-CHACHA20-POLY1305",
      "ECDHE-RSA-AES128-GCM-SHA256",
      "ECDHE-ECDSA-AES128-GCM-SHA256",
      "ECDHE-RSA-AES256-GCM-SHA384",
      "ECDHE-ECDSA-AES256-GCM-SHA384",
      "DHE-RSA-AES128-GCM-SHA256",
      "DHE-DSS-AES128-GCM-SHA256",
      "kEDH+AESGCM",
      "ECDHE-RSA-AES128-SHA256",
      "ECDHE-ECDSA-AES128-SHA256",
      "ECDHE-RSA-AES128-SHA",
      "ECDHE-ECDSA-AES128-SHA",
      "ECDHE-RSA-AES256-SHA384",
      "ECDHE-ECDSA-AES256-SHA384",
      "ECDHE-RSA-AES256-SHA",
      "ECDHE-ECDSA-AES256-SHA",
      "DHE-RSA-AES128-SHA256",
      "DHE-RSA-AES128-SHA",
      "DHE-DSS-AES128-SHA256",
      "DHE-RSA-AES256-SHA256",
      "DHE-DSS-AES256-SHA",
      "DHE-RSA-AES256-SHA",
      "ECDHE-RSA-DES-CBC3-SHA",
      "ECDHE-ECDSA-DES-CBC3-SHA",
      "EDH-RSA-DES-CBC3-SHA",
      "AES128-GCM-SHA256",
      "AES256-GCM-SHA384",
      "AES128-SHA256",
      "AES256-SHA256",
      "AES128-SHA",
      "AES256-SHA",
      "AES",
      "DES-CBC3-SHA",
      "HIGH",
      "SEED",
      "!aNULL",
      "!eNULL",
      "!EXPORT",
      "!DES",
      "!RC4",
      "!MD5",
      "!PSK",
      "!RSAPSK",
      "!aDH",
      "!aECDH",
      "!EDH-DSS-DES-CBC3-SHA",
      "!KRB5-DES-CBC3-SHA",
      "!SRP"
    ]

    this.ciphers = this.cipherSuites.join(':')
    this.minimumTLSVersion = SSL_OP_NO_SSLv3;
  }
}

