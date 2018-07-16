/**
 * Create the sessions database table if it does not exist
 * @param {Function} callback
 */
export declare function createDB(): Promise<string>;
/**
 * Fetch session key from database based on remote address
 * @param {string} remoteAddress
 */
export declare function fetchSessionKeyByConnectionId(connectionId: number): Promise<any>;
export declare function updateSessionKey(customerId: number, sessionKey: string, contextId: string, connectionId: number): Promise<null>;
