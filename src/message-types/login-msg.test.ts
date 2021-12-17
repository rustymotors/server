// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import test from "ava";
import { LoginMessage } from "./index";

const inboundBuffer = Buffer.alloc(41);
inboundBuffer.write("NotAPerson", 24);
inboundBuffer.write("0.0.0.0", 34);
const loginMessage1 = new LoginMessage(inboundBuffer);

test("LoginMsg", (t) => {
  const {
    appId,
    toFrom,
    msgNo,
    customerId,
    personaId,
    lotOwnerId,
    brandedPartId,
    skinId,
    personaName,
    version,
    data,
  } = loginMessage1;
  t.is(appId, 0);

  t.is(toFrom, 0);

  t.is(msgNo, 0);

  t.is(customerId, 0);

  t.is(personaId, 0);

  t.is(lotOwnerId, 0);

  t.is(brandedPartId, 0);

  t.is(skinId, 0);

  t.deepEqual(Buffer.from(personaName), Buffer.from("\0\0NotAPerson"));

  t.deepEqual(Buffer.from(version), Buffer.from("0.0.0.0"));

  t.is(data, inboundBuffer);
  
});
