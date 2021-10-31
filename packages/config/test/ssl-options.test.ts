// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import t from "tap";
import { _sslOptions } from "../src/ssl-options";

const fakeConfig = {
  certificate: {
    certFilename: "/cert/cert.pem",
    privateKeyFilename: "/cert/private.key",
    publicKeyFilename: "",
  },
  serverSettings: {
    ipServer: "",
  },
  serviceConnections: {
    databaseURL: "",
  },
  defaultLogLevel: "warn",
};

t.test("sslOptions()", (t) => {
  t.test(
    "will throw an error when unable to locate the certificate",
    async (t) => {
      //  Deepcode ignore WrongNumberOfArgs/test: false positive
      t.throws(() => _sslOptions(fakeConfig.certificate), {
        message: /cert.pem/,
      });
      t.end();
    }
  );
  t.end();
});
