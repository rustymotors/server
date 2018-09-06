// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// This is a subset of https://github.com/certsimple/ssl-config

import { SSL_OP_NO_SSLv3 } from "constants";

export class SSLConfig {
  public cipherSuites: string[];
  public ciphers: string;
  public minimumTLSVersion: number;

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
      "!SRP",
    ];

    this.ciphers = this.cipherSuites.join(":");
    this.minimumTLSVersion = SSL_OP_NO_SSLv3;
  }
}
