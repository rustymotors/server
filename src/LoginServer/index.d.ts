/// <reference types="node" />
import { Connection } from "../Connection";
import { IRawPacket } from "../listenerThread";
interface IUser {
    contextId: string;
    customerId: Buffer;
    userId: Buffer;
}
export declare function npsGetCustomerIdByContextId(contextId: string): IUser;
export declare function loginDataHandler(rawPacket: IRawPacket): Promise<Connection>;
export {};
