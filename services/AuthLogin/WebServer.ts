// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as fs from "fs";
import * as yaml from "js-yaml";
import { Logger } from "../shared/logger";
import * as https from "https";
import * as SSLConfig from "ssl-config";

import { IServerConfiguration } from "../shared/interfaces/IServerConfiguration";

const CONFIG: IServerConfiguration = yaml.safeLoad(
  fs.readFileSync("./services/shared/config.yml", "utf8")
);

const { serverConfig } = CONFIG;

const logger = new Logger().getLogger();

export function _sslOptions(
  configuration: IServerConfiguration["serverConfig"]
) {
  const sslConfig = new SSLConfig("old");
  return {
    cert: fs.readFileSync(configuration.certFilename),
    ciphers: sslConfig.ciphers,
    honorCipherOrder: true,
    key: fs.readFileSync(configuration.privateKeyFilename),
    rejectUnauthorized: false,
    secureOptions: sslConfig.minimumTLSVersion,
  };
}

const express = require("express");
const app = express();

app.use("/AuthLogin", (reg: any, res: any) => {
  res.set("Content-Type", "text/plain");
  res.end("Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e");
});

app.use("/cert", (reg: any, res: any) => {
  res.set("Content-disposition", "attachment; filename=cert.pem");
  res.end(fs.readFileSync(serverConfig.certFilename));
});

app.use("/key", (reg: any, res: any) => {
  res.set("Content-disposition", "attachment; filename=key.pub");
  res.end(fs.readFileSync(serverConfig.publicKeyFilename));
});

app.use("/registry", (reg: any, res: any) => {
  res.set("Content-disposition", "attachment; filename=mco.reg");
  res.end(fs.readFileSync(serverConfig.registryFilename));
});

app.get("/", (req: any, res: any) => {
  res.send("Hello World!");
});

app.use(function(req: any, res: any) {
  logger.debug(`Unknown Request`);
  res.send("Unknown request.");
});

export async function start() {
  const httpsServer = https
    .createServer(_sslOptions(serverConfig), app)
    .listen({ port: 443, host: "0.0.0.0" });
}
