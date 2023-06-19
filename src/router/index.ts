/**
 * @file src/router/src/index.ts
 * @description
 * @version 1.0.0
 * @license GNU Affero General Public License v3.0
 * @since 1.0.0
 */

import { GetServerLogger, getServerConfiguration } from "mcos/shared";
import type { TServerConfiguration, TServerLogger } from "mcos/shared";

/**
 * @description A buffer with a connection id
 * @export
 * @interface TConnectionBuffer
 * @since 1.0.0
 * @version 1.0.0
 * @license GNU Affero General Public License v3.0
 */
export type TConnectionBuffer = {
    connectionId: string;
    data: Buffer;
};

/**
 * @description A router for a port
 * @export
 * @interface IPortRouter
 * @since 1.0.0
 * @version 1.0.0
 * @license GNU Affero General Public License v3.0
 * @property {number} port The port to listen on
 * @property {(data: TConnectionBuffer) => Promise<Array<TConnectionBuffer>>} handler The handler for the port
 * @example
 * const router: IPortRouter = {
 *    port: 7003,
 *    handler: {
 *     processData: async (data: TConnectionBuffer): Promise<Array<TConnectionBuffer>> => {
 *      // do something with the data
 *     return [];
 *    }
 *   }
 * }
 */
export interface IPortRouter {
    port: number;
    handler: {
        processData: (
            data: TConnectionBuffer
        ) => Promise<Array<TConnectionBuffer>>;
    };
}

export class Router {
    private _config: TServerConfiguration;
    private _log: TServerLogger;
    private portRouters: Array<IPortRouter> = [];
    static instance: Router | undefined;

    constructor({
        config = getServerConfiguration(),
        log = GetServerLogger(),
    }: { config?: TServerConfiguration; log?: TServerLogger } = {}) {
        this._config = config;
        this._log = log;
        if (Router.instance) {
            // Return the existing instance
            return Router.instance; // skipcq: JS-0109
        }
        Router.instance = this;
    }

    /**
     * @description Create a port router
     * @param {number} port The port to listen on
     * @param {(data: TConnectionBuffer) => Promise<Array<TConnectionBuffer>>} handler The handler for the port
     * @return {IPortRouter} The port router
     * @memberof Router
     * @since 1.0.0
     * @version 1.0.0
     * @license GNU Affero General Public License v3.0
     * @example
     * const router: IPortRouter = {
     *   port: 7003,
     *   handler: async (data: TConnectionBuffer): Promise<Array<TConnectionBuffer>> => {
     *     // do something with the data
     *     return [];
     *   }
     * }
     */
    createPortRouter(
        port: number,
        handler: (data: TConnectionBuffer) => Promise<Array<TConnectionBuffer>>
    ): IPortRouter {
        return {
            port,
            handler: {
                processData: async (
                    data: TConnectionBuffer
                ): Promise<Array<TConnectionBuffer>> => {
                    return handler(data);
                },
            },
        };
    }

    /**
     * @description Add a port router
     * @param {IPortRouter} portRouter The port router to add
     * @return {0 | 1} 0 if the port router was added, 1 if the port router already exists
     * @memberof Router
     * @since 1.0.0
     * @version 1.0.0
     * @license GNU Affero General Public License v3.0
     * @example
     * const result = router.addPortRouter({
     *   port: 7003,
     *   handler: async (data: TConnectionBuffer): Promise<Array<TConnectionBuffer>> => {
     *     // do something with the data
     *     return [];
     *   }
     * });
     */
    addPortRouter(portRouter: IPortRouter): 0 | 1 {
        if (
            this.portRouters.find((router) => router.port === portRouter.port)
        ) {
            return 1;
        } else {
            this.portRouters.push(portRouter);
            return 0;
        }
    }

    /**
     * @description Get a port router by port
     * @param {number} port The port to get the router for
     * @return {IPortRouter} The port router
     * @throws {Error} If no port router is found for the port
     * @memberof Router
     * @since 1.0.0
     * @version 1.0.0
     * @license GNU Affero General Public License v3.0
     * @example
     * try {
     *   const portRouter = router.getPortRouter(7003);
     * } catch (error) {
     *   console.error(error);
     * }
     */
    getPortRouter(port: number): IPortRouter {
        const portRouter = this.portRouters.find(
            (portRouter) => portRouter.port === port
        );
        if (!portRouter) {
            throw new Error(`No port router found for port ${port}`);
        }
        return portRouter;
    }

    /**
     * @description Get all port routers
     * @return {Array<IPortRouter>} The port routers
     * @memberof Router
     * @since 1.0.0
     * @version 1.0.0
     * @license GNU Affero General Public License v3.0
     */
    getPortRouters(): Array<IPortRouter> {
        return this.portRouters;
    }
}
