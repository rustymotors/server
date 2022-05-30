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

import { APP_CONFIG } from '../config/index.js'

const ELOGGING_LEVELS: Record<string, number> = {
  'all': 0,
  'trace': 10,
  'debug': 20,
  'info': 30,
  'warn': 40,
  'error': 50,
  'fatal': 60,
  'off': 100
}


/**
 * @class
 */
class MCOSLogger {
  systemLogLevel: number
  service: string
  name: string
  constructor(options?: {service: string}) {
    this.systemLogLevel = ELOGGING_LEVELS[APP_CONFIG.MCOS.SETTINGS.LOG_LEVEL] || 30
    this.service = options?.service || ''
    this.name = 'mcos'
  }
  /**
   *
   * @param {{service: string}} options
   * @returns
   */
  static child(options: {service: string}): MCOSLogger {
    return new MCOSLogger(options)
  }
  /**
   *
   * @param {number} level
   * @param {string} message
   */
  private callLog (level: number, message: string) {
    if (this.systemLogLevel <= level) {
      // skipcq: JS-0002 - This is intentional and is the only time console is used
      console.log(`{"level":${level}, "time":"${Date.now()}","pid":${process.pid}, "name":"${this.name}", ${this.service} "msg": "${message}"}`)
    }
  }
      /** @param {string} message */
      trace (message: string): void { this.callLog(10, message) }
      /** @param {string} message */
      debug (message: string): void { this.callLog(20, message) }
      /** @param {string} message */
      info (message: string): void { this.callLog(30, message) }
      /** @param {string} message */
      warn (message: string): void { this.callLog(40, message) }
      /** @param {string} message */
      error (message: string): void { this.callLog(50, message) }
      /** @param {string} message */
      fatal (message: string): void { this.callLog(60, message) }
      /**
       * @param {ELOGGING_LEVELS} level
       * @param {string} message
       */
      log (level: string, message: string): void { this.callLog(ELOGGING_LEVELS[level] | 30, message) }

}

export { MCOSLogger as logger }
