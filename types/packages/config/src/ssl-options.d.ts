export type sslOptionsObj = {
    cert: string;
    honorCipherOrder: boolean;
    key: string;
    rejectUnauthorized: boolean;
};
/**
 *
 * @typedef {Object} sslOptionsObj
 * @property {string} cert
 * @property {boolean} honorCipherOrder
 * @property {string} key
 * @property {boolean} rejectUnauthorized
 */
/**
 *
 * @param {import(".").AppConfiguration["certificate"]} certificateSettings
 * @returns {sslOptionsObj}
 */
export function _sslOptions(certificateSettings: import(".").AppConfiguration["certificate"]): sslOptionsObj;
