/// <reference types="node" />
import { GameMessage, ClientMessage, SocketWithConnectionInfo, Logger, ServerConfiguration, ClientConnection } from "../../interfaces/index.js";
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
export declare function dataHandler({ data, connectionRecord, config, logger: log, connection, }: {
    data: Buffer;
    connectionRecord: SocketWithConnectionInfo;
    config: ServerConfiguration;
    logger: Logger;
    connection: ClientConnection;
    message: ClientMessage | GameMessage;
}): Promise<void>;
//# sourceMappingURL=sockets.d.ts.map