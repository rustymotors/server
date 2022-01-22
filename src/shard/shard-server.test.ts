// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import test from "ava";
import { AppConfiguration } from "../config/appconfig";
import { ShardServer } from "./index";

const testConfig: AppConfiguration = {
  MCOS: {
    CERTIFICATE: {
      PRIVATE_KEY_FILE: "",
      PUBLIC_KEY_FILE: "",
      CERTIFICATE_FILE: "",
    },

    SETTINGS: {
      HTTP_LISTEN_HOST: "",
      HTTP_EXTERNAL_HOST: "",
      SSL_LISTEN_HOST: "",
      SSL_EXTERNAL_HOST: "",
      SHARD_LISTEN_HOST: "",
      SHARD_EXTERNAL_HOST: "localhost",
      AUTH_LISTEN_HOST: "",
      AUTH_EXTERNAL_HOST: "",
      PATCH_LISTEN_HOST: "",
      PATCH_EXTERNAL_HOST: "",
      LISTEN_IP: "",
      AUTH_IP: "",
      DATABASE_CONNECTION_URI: "",
      LOG_LEVEL: "info",
    },
  },
}

test("ShardServer - should return a shard list", (t) => {
  t.regex(ShardServer.getInstance(testConfig)._generateShardList(), /\[The Clocktower\]/);
});
