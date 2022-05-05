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

import { AdminServer } from 'mcos-gateway'
import { AuthLogin } from 'mcos-auth'
import { PatchServer } from 'mcos-patch'
import { ShardServer } from 'mcos-shard'
import { APP_CONFIG } from 'mcos-shared/config'
import { logger } from 'mcos-shared/logger'

const log = logger.child({ service: 'http' })

/**
 * Routes incomming HTTP requests
 * @param {import("node:http").IncomingMessage} req
 * @param {import("node:http").ServerResponse} res
 * @returns {import("node:http").ServerResponse}
 */
export function httpListener (req, res) {
  if (req.url && req.url.startsWith('/AuthLogin')) {
    log.debug('ssl routing request to login web server')
    return AuthLogin.getInstance().handleRequest(req, res)
  }

  if (
    req.url &&
    (req.url === '/admin/connections' ||
      req.url === '/admin/connections/resetAllQueueState' ||
      req.url.startsWith('/admin'))
  ) {
    log.debug('ssl routing request to admin web server')
    return AdminServer.getAdminServer().handleRequest(req, res)
  }

  if (
    req.url === '/games/EA_Seattle/MotorCity/UpdateInfo' ||
    req.url === '/games/EA_Seattle/MotorCity/NPS' ||
    req.url === '/games/EA_Seattle/MotorCity/MCO'
  ) {
    log.debug('http routing request to patch server')
    return PatchServer.getInstance(APP_CONFIG).handleRequest(req, res)
  }
  if (
    req.url === '/cert' ||
    req.url === '/key' ||
    req.url === '/registry' ||
    req.url === '/ShardList/'
  ) {
    log.debug('http routing request to shard server')
    return ShardServer.getInstance(APP_CONFIG).handleRequest(req, res)
  }

  log.warn(
    `Unexpected request for ${req.url} from ${req.socket.remoteAddress}, skipping.`
  )
  res.statusCode = 404
  return res.end('Not found')
}
