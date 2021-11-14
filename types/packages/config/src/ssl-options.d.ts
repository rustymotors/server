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
 * @param {AppConfiguration["certificate"]} certificateSettings
 * @returns {sslOptionsObj}
 */
export function _sslOptions(
  certificateSettings: AppConfiguration["certificate"]
): sslOptionsObj;
export type sslOptionsObj = {
  cert: string;
  honorCipherOrder: boolean;
  key: string;
  rejectUnauthorized: boolean;
};
import { AppConfiguration } from ".";
