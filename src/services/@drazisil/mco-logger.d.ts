/// <reference types="@drazisil/mco-logger" />
declare module '@drazisil/mco-logger'; {
  /**
  * @param {Object} [options.args] optional args passed from program
  * @param {string} [options.level] optional logging level
  * @param {Object} [options.service] optional name of service to append
  */
  export interface LoggerOptions {
    args?: {
			verbose?: boolean;
		};
    level?: string;
    service?: string;
  }

  /**
  *
  * @param {string} message
  * @param {LoggerOptions} [options]
  * @returns {void}
  */
  export function debug(message: string, options?: LoggerOptions): void;
  /**
  * Return the logging level as set by $MCO_LOG_LEVEL or 'info'
  * @returns {string}
  */
  export function getDefaultLevel(): string;
  export function getDefaultService(): string;
  /**
  *
  * @param {LoggerOptions} [options]
  */
	export function getLogLevel(options?: LoggerOptions): string;
  /**
  *
  * @param {LoggerOptions} [options]
  * @returns {string}
  */
  export function getServiceName(options?: LoggerOptions): string;
	/**
  *
  * @param {string} message
  * @param {LoggerOptions} [options]
  * @returns void
  */
  export function log(message: string, options?: LoggerOptions): void;
	/**
  *
  * @param {LoggerOptions} [options]
  * @returns {boolean}
  */
  export function shouldDebug(options?: LoggerOptions): boolean;
}
