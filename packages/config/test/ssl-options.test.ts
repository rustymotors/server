// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as t from "tap";
import { _sslOptions } from "../src/ssl-options";
import { Module } from "module";

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

t.plan(2)

t.test("sslOptions()", () => {
  t.beforeEach(() => {
    // https://bensmithgall.com/blog/jest-mock-trick if this works!
    function mockFs() {
      const original = Module.createRequire("fs");
      return { ...original, statSync: {} };
    }

    t.mock("fs", () => mockFs());
  });

  t.test(
    "will throw an error when unable to locate the certificate",
    async () => {
      //  Deepcode ignore WrongNumberOfArgs/test: false positive
      t.throws(() => _sslOptions(fakeConfig.certificate, "testingSSLOptions"), {
        message: /cert.pem/,
      });
    }
  );
});
