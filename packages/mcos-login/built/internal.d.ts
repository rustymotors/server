/**
 *
 *
 * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
 * @return {Promise<import('mcos-shared/types').GSMessageArrayWithConnection>}
 */
export function handleData(dataConnection: import('mcos-shared/types').BufferWithConnection): Promise<import('mcos-shared/types').GSMessageArrayWithConnection>;
export const messageHandlers: {
    id: string;
    handler: typeof login;
}[];
/**
   * Process a UserLogin packet
   * @private
   * @param {import("mcos-shared/types").BufferWithConnection} dataConnection
   * @return {Promise<import('mcos-shared/types').GSMessageArrayWithConnection>}
   */
declare function login(dataConnection: import("mcos-shared/types").BufferWithConnection): Promise<import('mcos-shared/types').GSMessageArrayWithConnection>;
export {};
//# sourceMappingURL=internal.d.ts.map