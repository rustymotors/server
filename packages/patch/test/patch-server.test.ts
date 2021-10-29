// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, describe, it, beforeEach } from "@jest/globals";
import request from "supertest";
import { CastanetResponse, PatchServer } from "../src";

let patchServer: PatchServer;

// TODO: Rewrite tests - https://github.com/drazisil/mco-server/issues/1010
describe("PatchServer", () => {
  beforeEach(() => {
    patchServer = PatchServer.getInstance();
  });

  it.todo("PatchServer");

  it.todo("PatchServer - UpdateInfo");

  it.todo("PatchServer - NPS");

  it.todo("PatchServer - MCO");
});
