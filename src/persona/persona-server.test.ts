// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import test from "ava";
import { PersonaServer } from "./index";

import { SocketFactory } from "../socket-factory";
import { NPSMessage } from "../message-types/index";
import { EMessageDirection } from "../types/index";

let personaServer: PersonaServer;

  test.beforeEach(() => {
    personaServer = PersonaServer.getInstance();
  });

  test("PersonaServer Methods", async (t) => {
    const results = await personaServer.getPersonasByCustomerId(5_551_212);
    t.is(results.length, 2);
    if (typeof results[0] !== "undefined") {
      const name = results[0].name.toString("utf8");
      t.is(name, "Dr Brown");
    } else {
      t.true(false);
    }

    const personas = await personaServer.getPersonaMapsByCustomerId(5_551_212);
    if (typeof personas[0] !== "undefined") {
      const id1 = personas[0].id;
      const name1 = personas[0].name;
      t.is(id1.readInt32BE(0), 8_675_309);
      t.is(name1.toString("utf8").length, 30);
    } else {
      t.true(false);
    }

    const result = await personaServer.getPersonasByCustomerId(123_654);
    t.is(result.length, 0);

  });

  test("PersonaServer _npsSelectGamePersona()", async (t) => {
    const data = new NPSMessage(EMessageDirection.SENT).serialize();
    const results = await personaServer.handleSelectGamePersona(data);
    t.is(results.direction, EMessageDirection.SENT);

  });

  test("PersonaServer _npsNewGameAccount()", async (t) => {
    const data = new NPSMessage(EMessageDirection.SENT).serialize();
    const results = await personaServer.createNewGameAccount(data);
    t.is(results.direction, EMessageDirection.SENT);

  });

  test("PersonaServer _npsLogoutGameUser()", async (t) => {
    const data = new NPSMessage(EMessageDirection.SENT).serialize();
    const results = await personaServer.logoutGameUser(data);
    t.is(results.direction, EMessageDirection.SENT);

  });

  test("PersonaServer _npsCheckToken()", async (t) => {
    const data = new NPSMessage(EMessageDirection.SENT).serialize();
    const results = await personaServer.validateLicencePlate(data);
    t.is(results.direction, EMessageDirection.SENT);

  });

  test("PersonaServer _npsValidatePersonaName()", async (t) => {
    const data = new NPSMessage(EMessageDirection.SENT).serialize();
    const results = await personaServer.validatePersonaName(data);
    t.is(results.direction, EMessageDirection.SENT);

  });

  test("PersonaServer _send()", (t) => {
    const data = new NPSMessage(EMessageDirection.SENT);
    t.notThrows(() => {
      personaServer.sendPacket(SocketFactory.createSocket(), data);
    });

  });

  test("PersonaServer _npsGetPersonaMapsByCustomerId()", async (t) => {
    const personas1 = await personaServer.getPersonaMapsByCustomerId(
      2_868_969_472
    );

    t.is(personas1.length, 1);
    if (typeof personas1[0] !== "undefined") {
      t.deepEqual(personas1[0].name.toString("utf8"), "Doc Joe");
    } else {
      t.true(false);
    }

    const personas2 = await personaServer.getPersonaMapsByCustomerId(4);

    t.is(personas2.length, 0);

  });
