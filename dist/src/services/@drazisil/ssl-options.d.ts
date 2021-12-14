import { IAppConfiguration } from '../../../config';
import { ISslOptions } from '../../types';
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
 * @param {Object} certificateSettings
 * @param {string} certificateSettings.privateKeyFilename
 * @param {string} certificateSettings.publicKeyFilename
 * @param {string} certificateSettings.certFilename
 * @param {string} serviceName

   * @return {Promise<sslOptionsObj>}
   */
export declare function _sslOptions(certificateSettings: IAppConfiguration['certificate'], serviceName: string): ISslOptions;
