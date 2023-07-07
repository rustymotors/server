/**
 * @file src/router/src/index.ts
 * @description
 * @version 1.0.0
 * @license GNU Affero General Public License v3.0
 * @since 1.0.0
 */
/// <reference types="node" />
import type { TConfiguration, TServerLogger } from "mcos/shared/interfaces";
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
        processData: (data: TConnectionBuffer) => Promise<Array<TConnectionBuffer>>;
    };
}
export declare class Router {
    private _config;
    private _log;
    private portRouters;
    static instance: Router | undefined;
    constructor({ config, log, }?: {
        config?: TConfiguration;
        log?: TServerLogger;
    });
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
    createPortRouter(port: number, handler: (data: TConnectionBuffer) => Promise<Array<TConnectionBuffer>>): IPortRouter;
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
    addPortRouter(portRouter: IPortRouter): 0 | 1;
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
    getPortRouter(port: number): IPortRouter;
    /**
     * @description Get all port routers
     * @return {Array<IPortRouter>} The port routers
     * @memberof Router
     * @since 1.0.0
     * @version 1.0.0
     * @license GNU Affero General Public License v3.0
     */
    getPortRouters(): Array<IPortRouter>;
}
