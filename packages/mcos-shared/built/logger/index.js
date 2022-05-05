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
import { APP_CONFIG } from '../config/index.js';
const logger = {
    /**
     * @param {object} options
     * @param {string} [options.service]
     */
    child: (options) => {
        /** @typedef {'all' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'off'} ELOGGING_LEVELS */
        /** @typedef {0 | 10 | 20 | 30 | 40 | 50 | 60 | 100} ELOGGING_LEVELS_NUM */
        /**
         * @param {ELOGGING_LEVELS_NUM} level
         * @param {string} message
         */
        const callLog = (level, message) => {
            if (systemLogLevel <= level) {
                console.log(`{"level":${level}, "time":"${Date.now()}","pid":${process.pid}, "name":"${name}", ${service} "msg": "${message}"}`);
            }
        };
        /** @param {string | undefined} level */
        const toLevel = (level) => {
            if (typeof level === 'undefined') {
                return 30;
            }
            if (level === 'all') {
                return 0;
            }
            if (level === 'trace') {
                return 10;
            }
            if (level === 'debug') {
                return 20;
            }
            if (level === 'info') {
                return 30;
            }
            if (level === 'warn') {
                return 40;
            }
            if (level === 'error') {
                return 50;
            }
            if (level === 'fatal') {
                return 60;
            }
            if (level === 'off') {
                return 100;
            }
            return 30;
        };
        const systemLogLevel = toLevel(APP_CONFIG.MCOS.SETTINGS.LOG_LEVEL) || 30;
        const name = 'mcos';
        let service = '';
        if (options.service) {
            service = `"service":"${options.service}, "`;
        }
        return {
            /** @param {string} message */
            trace: (message) => { callLog(10, message); },
            /** @param {string} message */
            debug: (message) => { callLog(20, message); },
            /** @param {string} message */
            info: (message) => { callLog(30, message); },
            /** @param {string} message */
            warn: (message) => { callLog(40, message); },
            /** @param {string} message */
            error: (message) => { callLog(50, message); },
            /** @param {string} message */
            fatal: (message) => { callLog(60, message); },
            /**
             * @param {ELOGGING_LEVELS} level
             * @param {string} message
             */
            log: (level, message) => { callLog(30, message); }
        };
    }
};
// `{"level":30,"time":1651694127211,"pid":19,"hostname":"4a44b787f50f","name":"mcos","service":"mcos:gateway:connections","msg":"I have not seen connections from 10.10.5.8 on 8228 before, adding it."}`
export { logger };
//# sourceMappingURL=index.js.map