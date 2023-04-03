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

import Sentry from "@sentry/node";
import { startListeners } from "./packages/mcos-gateway/src/index.js";
import log from "./log.js";

Sentry.init({
    dsn: "https://9cefd6a6a3b940328fcefe45766023f2@o1413557.ingest.sentry.io/4504406901915648",
  
    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
  });

try {
    if (typeof process.env.EXTERNAL_HOST === "undefined") {
        throw new Error("Please set EXTERNAL_HOST");
    }
    if (typeof process.env.PRIVATE_KEY_FILE === "undefined") {
        throw new Error("Please set PRIVATE_KEY_FILE");
    }
    startListeners();
} catch (err) {
    Sentry.captureException(err);
    log.error(`Error in core server: ${String(err)}`);
    log.error("Server exiting");
    process.exit(1);
}
