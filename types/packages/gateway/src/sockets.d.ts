/// <reference types="node" resolution-mode="require"/>
import { Logger } from "pino";
import { GameMessage, ClientMessage, SocketWithConnectionInfo, ClientConnection } from "../../interfaces/index.js";
import { Configuration } from "../../shared/Configuration.js";
/**
 * Convert to zero padded hex
 *
 * @export
 * @param {Buffer} data
 * @return {string}
 */
export declare function toHex(data: Buffer): string;
/**
 * The onData handler
 * takes the data buffer and creates a {@link BufferWithConnection} object
 */
export declare function dataHandler({ data, connectionRecord, config, log: log, connection, }: {
    data: Buffer;
    connectionRecord: SocketWithConnectionInfo;
    config: Configuration;
    log: Logger;
    connection: ClientConnection;
    message: ClientMessage | GameMessage;
}): Promise<void>;
//# sourceMappingURL=sockets.d.ts.map