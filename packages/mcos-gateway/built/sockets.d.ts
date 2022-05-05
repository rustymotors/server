/**
   * Server listener method
   *
   * @param {import("node:net").Socket} socket
   * @return {void}
   */
export function socketListener(socket: import("node:net").Socket): void;
/**
   * Replays the unproccessed packet to the connection manager
   * @param {{connection: import("mcos-shared").TCPConnection, data: Buffer}} packet
   * @returns {Promise<{err: Error | null, data: import("mcos-shared").TCPConnection | null}>}
   */
export function processPacket(packet: {
    connection: import("mcos-shared").TCPConnection;
    data: Buffer;
}): Promise<{
    err: Error | null;
    data: import("mcos-shared").TCPConnection | null;
}>;
//# sourceMappingURL=sockets.d.ts.map