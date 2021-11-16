// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import t from "tap";
import { GenericRequestMessage } from "./index";

const genericRequestMessage1 = new GenericRequestMessage();

t.test("GenericRequestMsg", (t) => {
  const { msgNo } = genericRequestMessage1;
  t.equal(msgNo, 0);
  t.same(genericRequestMessage1.serialize(), Buffer.alloc(16));
  t.end();
});
