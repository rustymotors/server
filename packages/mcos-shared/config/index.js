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
