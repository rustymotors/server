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

/**
 *
 *
 * @export
 * @typedef AppConfiguration
 * @property {object} MCOS
 * @property {object} MCOS.CERTIFICATE
 * @property {string} MCOS.CERTIFICATE.PRIVATE_KEY_FILE
 * @property {string} MCOS.CERTIFICATE.PUBLIC_KEY_FILE
 * @property {string} MCOS.CERTIFICATE.CERTIFICATE_FILE
 * @property {object} MCOS.SETTINGS
 * @property {string} MCOS.SETTINGS.HTTP_LISTEN_HOST
 * @property {string} MCOS.SETTINGS.HTTP_EXTERNAL_HOST
 * @property {string} MCOS.SETTINGS.SSL_LISTEN_HOST
 * @property {string} MCOS.SETTINGS.SSL_EXTERNAL_HOST
 * @property {string} MCOS.SETTINGS.SHARD_LISTEN_HOST
 * @property {string} MCOS.SETTINGS.SHARD_EXTERNAL_HOST
 * @property {string} MCOS.SETTINGS.AUTH_LISTEN_HOST
 * @property {string} MCOS.SETTINGS.AUTH_EXTERNAL_HOST
 * @property {string} MCOS.SETTINGS.PATCH_LISTEN_HOST
 * @property {string} MCOS.SETTINGS.PATCH_EXTERNAL_HOST
 * @property {string} MCOS.SETTINGS.DATABASE_CONNECTION_URI
 * @property {string} MCOS.SETTINGS.LOG_LEVEL
 */

/** @type {AppConfiguration} */
export const APP_CONFIG = {
  MCOS: {
    CERTIFICATE: {
      PRIVATE_KEY_FILE: 'data/private_key.pem',
      PUBLIC_KEY_FILE: 'data/pub.key',
      CERTIFICATE_FILE: 'data/mcouniverse.crt'
    },

    SETTINGS: {
      HTTP_LISTEN_HOST: '0.0.0.0',
      HTTP_EXTERNAL_HOST: '10.10.5.20',
      SSL_LISTEN_HOST: '0.0.0.0',
      SSL_EXTERNAL_HOST: '10.10.5.20',
      SHARD_LISTEN_HOST: '0.0.0.0',
      SHARD_EXTERNAL_HOST: '10.10.5.20',
      AUTH_LISTEN_HOST: '0.0.0.0',
      AUTH_EXTERNAL_HOST: '10.10.5.20',
      PATCH_LISTEN_HOST: '0.0.0.0',
      PATCH_EXTERNAL_HOST: '10.10.5.20',
      DATABASE_CONNECTION_URI: 'postgresql://postgres:password@db:5432/mcos',
      LOG_LEVEL: 'debug'
    }
  }
}
