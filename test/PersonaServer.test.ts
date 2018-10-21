// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Socket } from "net";
import { NPSMsg } from "../src/messageTypes/NPSMsg";
import { PersonaServer } from "../src/PersonaServer/PersonaServer";

describe("PersonaServer Methods", async () => {
  const personaServer = new PersonaServer();
  describe("_npsGetPersonaMaps", async () => {
    test("returns a valid NPSMsg", async () => {
      const responseMessage = await personaServer._npsGetPersonaMaps(
        new Socket(),
        Buffer.from([
          0x01,
          0x01,
          0x01,
          0x01,
          0x01,
          0x01,
          0x01,
          0x01,
          0x01,
          0x01,
          0x01,
          0x01,
          0x01,
          0x01,
          0x01,
          0x01,
          0x01,
          0x01,
          0x01,
          0x01,
        ])
      );
      expect(responseMessage).toBeInstanceOf(NPSMsg);
    });
  });
  describe("_npsGetPersonaMapsByCustomerId", async () => {
    test("returns a valid persona id - 5551212", async () => {
      const personas = await personaServer._npsGetPersonaMapsByCustomerId(
        5551212
      );
      const { id } = personas[0];
      expect(id.readInt32BE(0)).toEqual(8675309);
    });

    test("returns a valid name - d316cd2dd6bf870893dfbaaf17f965884e", async () => {
      const personas = await personaServer._npsGetPersonaMapsByCustomerId(
        5551212
      );
      const { name } = personas[0];
      expect(name.toString("utf8").length).toEqual(30);
      expect(name.toString("utf8")).toContain("Dr Brown");
    });
  });
});
