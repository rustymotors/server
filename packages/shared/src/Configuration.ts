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

import { getServerLogger } from 'rusty-motors-logger';
import config from 'config';
import 'dotenv/config';

/**
 * @module shared/Configuration
 * @exports Configuration
 */

export class Configuration {
    certificateFile!: string;
    privateKeyFile!: string;
    publicKeyFile!: string;
    host!: string;
    logLevel!: string;
    static instance: Configuration | undefined;

    /**
     * Constructs a new Configuration instance.
     *
     * @param {Object} params - The configuration parameters.
     * @param {string} params.host - The host address.
     * @param {string} params.certificateFile - The path to the certificate file.
     * @param {string} params.privateKeyFile - The path to the private key file.
     * @param {string} params.publicKeyFile - The path to the public key file.
     * @param {string} params.logLevel - The logging level.
     * @param {Logger} params.logger - The logger instance.
     */
    constructor({
        host,
        certificateFile,
        privateKeyFile,
        publicKeyFile,
        logLevel,
        logger,
    }: {
        host: string;
        certificateFile: string;
        privateKeyFile: string;
        publicKeyFile: string;
        logLevel: string;
        logger: any; // Relaxed type to avoid pino vs custom logger conflict
    }) {
        try {
            this.certificateFile = certificateFile;

            this.privateKeyFile = privateKeyFile;

            this.publicKeyFile = publicKeyFile;

            this.host = host;

            this.logLevel = logLevel.toLowerCase();
            Configuration.instance = this;
        } catch (error) {
            logger.fatal(`Error in core server: ${String(error)}`);
        }
    }

    /**
     * Creates a new instance of the Configuration class.
     *
     * @param host - The host address.
     * @param certificateFile - The path to the certificate file.
     * @param privateKeyFile - The path to the private key file.
     * @param publicKeyFile - The path to the public key file.
     * @param logLevel - The logging level.
     * @param logger - The logger instance.
     * @returns A new Configuration instance.
     */
    static newInstance({
        host,
        certificateFile,
        privateKeyFile,
        publicKeyFile,
        logLevel,
        logger,
    }: {
        host: string;
        certificateFile: string;
        privateKeyFile: string;
        publicKeyFile: string;
        logLevel: string;
        logger: any; // Relaxed type
    }): Configuration {
        return new Configuration({
            host,
            certificateFile,
            privateKeyFile,
            publicKeyFile,
            logLevel,
            logger,
        });
    }

    /**
     * Returns the singleton instance of the Configuration class.
     *
     * @throws {Error} If the Configuration instance has not been initialized using newInstance.
     * @returns {Configuration} The singleton instance of the Configuration class.
     */
    static getInstance(): Configuration {
        if (typeof Configuration.instance === 'undefined') {
            throw new Error(
                'Configuration needs to be initialized using newInstance',
            );
        }

        return Configuration.instance;
    }
}

export function getServerConfiguration(): Configuration {
    const logger = getServerLogger('core');
    return new Configuration({
        host: config.get<string>('host'),
        certificateFile: config.get<string>('certificateFile'),
        privateKeyFile: config.get<string>('privateKeyFile'),
        publicKeyFile: config.get<string>('publicKeyFile'),
        logLevel: config.get<string>('logLevel'),
        logger,
    });
}
