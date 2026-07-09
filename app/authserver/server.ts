// detroit is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import "./instrument.cjs";

import * as Sentry from "@sentry/node";

import {
	getServerLogger,
} from "rusty-motors-shared";
import { authDB } from "./db.ts";
import { getConfig } from "./config.ts";
import { AuthServer } from "./AuthServer.ts";

const APP_NAME = "auth-server";
const coreLogger = getServerLogger(APP_NAME);

async function main(config = getConfig(), logger = coreLogger) {
	coreLogger.info("Starting Auth Server...");
	const authServer = new AuthServer(config, logger);

	console.log("Starting server...");
	authServer.start();
}

main().catch((err) => {
	const coreLogger = getServerLogger("core");
	coreLogger.fatal(`Unhandled exception in core server: ${String(err)}`);
	Sentry.captureException(err);
	Sentry.flush(2000).finally(() => {
		process.exitCode = 1;
	});
});

