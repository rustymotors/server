// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import t from "tap";
import { ShardServer } from "./index";

t.test("ShardServer", (t) => {
  t.test("should return a shard list", (t) => {
    t.match(ShardServer.getInstance()._generateShardList(), "[The Clocktower]");
    t.end();
  });
  t.end();
});
