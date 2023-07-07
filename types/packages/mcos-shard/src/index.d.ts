import { TConfiguration } from "mcos/shared/interfaces";
/**
 * Read the TLS certificate file
 * @param {TConfiguration} config
 * @return {string}
 */
export declare function handleGetCert(config: TConfiguration): string;
/**
 * Generate Windows registry configuration file for clients
 * @param {TConfiguration} config
 * @return {string}
 */
export declare function handleGetRegistry(config: TConfiguration): string;
/**
 *  Read TLS public key file to string
 * @param {TConfiguration} config
 * @return {string}
 */
export declare function handleGetKey(config: TConfiguration): string;
