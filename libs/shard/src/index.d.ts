import { Configuration } from "../../shared";
/**
 * Read the TLS certificate file
 * @param {TConfiguration} config
 * @return {string}
 */
export declare function handleGetCert(config: Configuration): string;
/**
 * Generate Windows registry configuration file for clients
 * @param {TConfiguration} config
 * @return {string}
 */
export declare function handleGetRegistry(config: Configuration): string;
/**
 *  Read TLS public key file to string
 * @param {TConfiguration} config
 * @return {string}
 */
export declare function handleGetKey(config: Configuration): string;
