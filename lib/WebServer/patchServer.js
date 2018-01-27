// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

const app = require('express')();
const http = require('http');
const configurationFile = require('../../config/config.json');

const logger = require('../../src/logger.js');

const castanetResponse = {
  headers: "'Content-Type', 'application/octet-stream'",
  body: Buffer.from('cafebeef00000000000003', 'hex'),
};

// TODO: Combine these threes functions.
// The long-term plan is to actually have an update server,
// but it's very low priority
function patchUpdateInfo() {
  return castanetResponse;
}

function patchNPS() {
  return castanetResponse;
}

function patchMCO() {
  return castanetResponse;
}

/**
 * Generate a shard list web document
 * @param {JSON} config
 */
function generateShardList(config) {
  return `[The Clocktower]
  Description=The Clocktower
  ShardId=44
  LoginServerIP=${config.ipServer}
  LoginServerPort=8226
  LobbyServerIP=${config.ipServer}
  LobbyServerPort=7003
  MCOTSServerIP=${config.ipServer}
  StatusId=0
  Status_Reason=
  ServerGroup_Name=Group - 1
  Population=88
  MaxPersonasPerUser=2
  DiagnosticServerHost=${config.ipServer}
  DiagnosticServerPort=80`;
}

/**
 * Start the HTTP web server
 * @param {Function} callback
 */
function start(callback) {
  const config = configurationFile.serverConfig;

  /**
   * Return the shard list
   */
  app.get('/ShardList/', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(generateShardList(config));
  });

  /**
   * These 3 methods make up the patch server
   */
  app.post('/games/EA_Seattle/MotorCity/UpdateInfo', (req, res) => {
    const response = patchUpdateInfo(req);
    res.set(response.headers);
    res.send(response.body);
  });

  app.post('/games/EA_Seattle/MotorCity/NPS', (req, res) => {
    const response = patchNPS(req);
    res.set(response.headers);
    res.send(response.body);
  });

  app.post('/games/EA_Seattle/MotorCity/MCO', (req, res) => {
    const response = patchMCO(req);
    res.set(response.headers);
    res.send(response.body);
  });

  /**
   * Fallback if request doesn't match above
   */
  app.use((req, res) => {
    logger.debug('HTTP');
    logger.debug('Headers: ', req.headers);
    logger.debug(`Method: ${req.method}`);
    logger.debug(`Url: ${req.url}`);
    res.send('404');
  });

  const serverPatch = http.createServer(app);
  serverPatch.listen('80', '0.0.0.0', () => {});

  callback(null);
}

module.exports = {
  start,
};
