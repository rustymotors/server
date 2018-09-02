// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
