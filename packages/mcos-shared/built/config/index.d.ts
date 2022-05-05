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
export const APP_CONFIG: AppConfiguration;
export type AppConfiguration = {
    MCOS: {
        CERTIFICATE: {
            PRIVATE_KEY_FILE: string;
            PUBLIC_KEY_FILE: string;
            CERTIFICATE_FILE: string;
        };
        SETTINGS: {
            HTTP_LISTEN_HOST: string;
            HTTP_EXTERNAL_HOST: string;
            SSL_LISTEN_HOST: string;
            SSL_EXTERNAL_HOST: string;
            SHARD_LISTEN_HOST: string;
            SHARD_EXTERNAL_HOST: string;
            AUTH_LISTEN_HOST: string;
            AUTH_EXTERNAL_HOST: string;
            PATCH_LISTEN_HOST: string;
            PATCH_EXTERNAL_HOST: string;
            DATABASE_CONNECTION_URI: string;
            LOG_LEVEL: string;
        };
    };
};
//# sourceMappingURL=index.d.ts.map