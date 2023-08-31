import { ServerConfiguration } from "../../interfaces/index.js";
/**
 * Read the TLS certificate file
 * @param {TConfiguration} config
 * @return {string}
 */
export declare function handleGetCert(config: ServerConfiguration): string;
/**
 * Generate Windows registry configuration file for clients
 * @param {TConfiguration} config
 * @return {string}
 */
export declare function handleGetRegistry(config: ServerConfiguration): string;
/**
 *  Read TLS public key file to string
 * @param {TConfiguration} config
 * @return {string}
 */
export declare function handleGetKey(config: ServerConfiguration): string;
//# sourceMappingURL=index.d.ts.map