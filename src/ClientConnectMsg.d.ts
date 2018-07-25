/// <reference types="node" />
export default class ClientConnectMsg {
    customerId: number;
    personaId: number;
    personaName: string;
    rawBuffer: Buffer;
    msgId: number;
    private custName;
    private mcVersion;
    constructor(buffer: Buffer);
    /**
     * dumpPacket
     */
    dumpPacket(): void;
}
