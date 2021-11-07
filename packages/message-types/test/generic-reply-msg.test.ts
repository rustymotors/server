// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import t from "tap";
import { GenericReplyMessage } from "../src/index";

const genericReplyMessage1 = new GenericReplyMessage();

t.test("GenericReplyMsg", (t) => {
  const { msgNo, toFrom } = genericReplyMessage1;
  t.equal(msgNo, 0);
  t.equal(toFrom, 0);
  t.same(genericReplyMessage1.serialize(), Buffer.alloc(16));
  t.end();
});
