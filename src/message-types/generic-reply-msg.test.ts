// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import test from "ava";
import { GenericReplyMessage } from "./index";

const genericReplyMessage1 = new GenericReplyMessage();

test("GenericReplyMsg", (t) => {
  const { msgNo, toFrom } = genericReplyMessage1;
  t.is(msgNo, 0);
  t.is(toFrom, 0);
  t.deepEqual(genericReplyMessage1.serialize(), Buffer.alloc(16));
  
});
