// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { PersonaServer } from "./PersonaServer";

const personaServer = new PersonaServer();

test("returns a valid persona id - 5551212", async () => {
  const { id } = await personaServer._npsGetPersonaMapsByCustomerId(5551212);
  expect(id.readInt32BE(0)).toEqual(8675309);
});

test("returns a valid name - d316cd2dd6bf870893dfbaaf17f965884e", async () => {
  const { name } = await personaServer._npsGetPersonaMapsByCustomerId(5551212);
  expect(name.toString("utf8").length).toEqual(30);
  expect(name.toString("utf8")).toContain("Dr Brown");
});
