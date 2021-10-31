// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import t from "tap";
import { LoginMessage } from "../src/index";

const inboundBuffer = Buffer.alloc(42);
inboundBuffer.write("NotAPerson", 24);
inboundBuffer.write("0.0.0.0", 34);
const loginMessage1 = new LoginMessage(inboundBuffer);

t.test("LoginMsg", (t) => {
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
  t.equal(appId, 0);

  t.equal(toFrom, 0);

  t.equal(msgNo, 0);

  t.equal(customerId, 0);

  t.equal(personaId, 0);

  t.equal(lotOwnerId, 0);

  t.equal(brandedPartId, 0);

  t.equal(skinId, 0);

  t.match(personaName, "NotAPerson");

  t.match(version, "0.0.0.0");

  t.same(data, inboundBuffer);
  t.end();
});
