export type ConnectionWithPacket = {
    connection: import("../../core/src/tcpConnection").TCPConnection;
    packet: import("../../message-types/src/messageNode.js").MessageNode;
    lastError?: string;
};
export type ConnectionWithPackets = {
    connection: import("../../core/src/tcpConnection").TCPConnection;
    packetList: import("../../message-types/src/messageNode.js").MessageNode[];
};
export type UnprocessedPacket = {
    connectionId: string;
    connection: import("../../core/src/tcpConnection").TCPConnection;
    data: Buffer;
    localPort: number | undefined;
    remoteAddress: string | undefined;
    timestamp: number;
};
export type EMessageDirection = string;
export namespace EMessageDirection {
    const RECEIVED: string;
    const SENT: string;
}
