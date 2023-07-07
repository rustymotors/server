/// <reference types="node" />
import { IConnection, IMessage, ITCPMessage, TConfiguration, TServerLogger, TSocketWithConnectionInfo } from "mcos/shared/interfaces";
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
export declare function dataHandler({ data, connectionRecord, config, logger: log, connection, message, }: {
    data: Buffer;
    connectionRecord: TSocketWithConnectionInfo;
    config: TConfiguration;
    logger: TServerLogger;
    connection: IConnection;
    message: IMessage | ITCPMessage;
}): Promise<void>;
