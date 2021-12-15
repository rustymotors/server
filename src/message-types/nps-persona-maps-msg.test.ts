// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import test from "ava";
import { EMessageDirection } from "../types/index";
import { NPSPersonaMapsMessage } from "./index";

test("NPSPersonaMapsMsg", (t) => {
  const npsPersonaMapsMessage = new NPSPersonaMapsMessage(
    EMessageDirection.RECEIVED
  );
  t.is(npsPersonaMapsMessage.direction, EMessageDirection.RECEIVED);
  t.is(npsPersonaMapsMessage.msgNo, 0x6_07);
  
});
