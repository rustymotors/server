// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import t from "tap";
import { _sslOptions } from "./ssl-options";

t.test("sslOptions()", (t) => {
  t.test(
    "will throw an error when unable to locate the certificate",
    async (t) => {
      process.env.MCOS__CERTIFICATE__CERTIFICATE_FILE = "/cert/cert.pem";
      //  Deepcode ignore WrongNumberOfArgs/test: false positive
      t.throws(() => _sslOptions(), {
        message: /cert.pem/,
      });
      delete process.env.MCOS__CERTIFICATE__CERTIFICATE_FILE;
      t.end();
    }
  );
  t.end();
});
