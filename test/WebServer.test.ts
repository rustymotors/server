// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
import * as SSLConfig from "ssl-config";
import { IServerConfiguration } from "../src/IServerConfiguration";
import { Logger } from "../src/logger";
import { WebServer } from "../src/WebServer";

const logger = new Logger().getLogger();
const webServer = new WebServer(logger);

const config: IServerConfiguration = {
  serverConfig: {
    certFilename: "data/cert.pem",
    ipServer: "xxx",
    privateKeyFilename: "data/private_key.pem",
    publicKeyFilename: "data/pub.key",
  },
};

describe("WebServer", () => {
  test("has instance of Logger", () => {
    expect(webServer.logger).toBe(logger);
  });
  describe("_sslOptions", () => {
    const { serverConfig } = config;
    const sslConfig = new SSLConfig("old");
    const sslOptions = webServer._sslOptions(serverConfig);
    test("has a ciphers property", () => {
      expect(typeof sslOptions.ciphers).toEqual("string");
    });
    test("matches 'old'", () => {
      expect(sslOptions.ciphers).toMatch(sslConfig.ciphers);
    });
  });
});
