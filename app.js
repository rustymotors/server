// mcos is a game server, written from scratch, for an old game
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

import { Sentry } from "mcos/shared";
import { startListeners } from "./packages/mcos-gateway/src/index.js";
import { setServerConfiguration, GetServerLogger } from "mcos/shared";

const log = GetServerLogger();


try {
    if (typeof process.env.EXTERNAL_HOST === "undefined") {
        console.error("Please set EXTERNAL_HOST");
        process.exit(1)
    }
    if (typeof process.env.CERTIFICATE_FILE === "undefined") {
        console.error("Please set CERTIFICATE_FILE");
        process.exit(1)
    }
    if (typeof process.env.PRIVATE_KEY_FILE === "undefined") {
        console.error("Please set PRIVATE_KEY_FILE");
        process.exit(1)
    }
    if (typeof process.env.PUBLIC_KEY_FILE === "undefined") {
        console.error("Please set PUBLIC_KEY_FILE");
        process.exit(1)
    }
    const config = setServerConfiguration(
        process.env.EXTERNAL_HOST,
        process.env.CERTIFICATE_FILE,
        process.env.PRIVATE_KEY_FILE,
        process.env.PUBLIC_KEY_FILE,
        "debug"
        );
    const appLog = GetServerLogger(config.LOG_LEVEL);
    startListeners(config, appLog);
} catch (err) {
    Sentry.captureException(err);
    log("crit", `Error in core server: ${String(err)}`);
    process.exit(1);
}
