// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import t from "tap";
import { PersonaServer } from "../src";

import { SocketFactory } from "./../../test-helpers/socket-factory";
import { NPSMessage } from "mcos-messages";
import { EMessageDirection } from "mcos-types";

t.mock("net", {});
let personaServer: PersonaServer;

t.test("Persona Server", () => {
  t.beforeEach(() => {
    personaServer = PersonaServer.getInstance();
  });

  t.test("PersonaServer Methods", async () => {
    const results = await personaServer.getPersonasByCustomerId(5_551_212);
    t.equal(results.length, 2);
    const name = results[0].name.toString("utf8");
    t.has(name, "Dr Brown");

    const personas = await personaServer.getPersonaMapsByCustomerId(5_551_212);
    const id1 = personas[0].id;
    const name1 = personas[0].name;
    t.equal(id1.readInt32BE(0), 8_675_309);
    t.equal(name1.toString("utf8").length, 30);

    const result = personaServer.getPersonasByCustomerId(123_654);
    t.throws(
      function () {
        () => personaServer.getPersonasByCustomerId(123_654);
      },
      { message: /Unable to locate a persona/ }
    );
  });

  t.test("PersonaServer _npsSelectGamePersona()", async () => {
    const data = new NPSMessage(EMessageDirection.SENT).serialize();
    const results = await personaServer.handleSelectGamePersona(data);
    t.equal(results.direction, EMessageDirection.SENT);
  });

  t.test("PersonaServer _npsNewGameAccount()", async () => {
    const data = new NPSMessage(EMessageDirection.SENT).serialize();
    const results = await personaServer.createNewGameAccount(data);
    t.equal(results.direction, EMessageDirection.SENT);
  });

  t.test("PersonaServer _npsLogoutGameUser()", async () => {
    const data = new NPSMessage(EMessageDirection.SENT).serialize();
    const results = await personaServer.logoutGameUser(data);
    t.equal(results.direction, EMessageDirection.SENT);
  });

  t.test("PersonaServer _npsCheckToken()", async () => {
    const data = new NPSMessage(EMessageDirection.SENT).serialize();
    const results = await personaServer.validateLicencePlate(data);
    t.equal(results.direction, EMessageDirection.SENT);
  });

  t.test("PersonaServer _npsValidatePersonaName()", async () => {
    const data = new NPSMessage(EMessageDirection.SENT).serialize();
    const results = await personaServer.validatePersonaName(data);
    t.equal(results.direction, EMessageDirection.SENT);
  });

  t.test("PersonaServer _send()", () => {
    const data = new NPSMessage(EMessageDirection.SENT);
    t.doesNotThrow(() => {
      personaServer.sendPacket(SocketFactory.createSocket(), data);
    });
  });

  t.test("PersonaServer _npsGetPersonaMapsByCustomerId()", async () => {
    const personas1 = await personaServer.getPersonaMapsByCustomerId(
      2_868_969_472
    );

    t.equal(personas1.length, 1);
    t.has(personas1[0].name.toString("utf8"), "Doc Joe");

    const personas2 = await personaServer.getPersonaMapsByCustomerId(4);

    t.equal(personas2.length, 0);
  });
});
