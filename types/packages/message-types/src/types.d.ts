export type InpsPersonaMapsPersonaRecord = {
    /**
     * - uint16
     */
    personaCount: number;
    /**
     * - uint16
     */
    unknown1: number;
    /**
     * - uint16
     */
    maxPersonas: number;
    /**
     * - uint16
     */
    unknown2: number;
    /**
     * - uint32
     */
    id: number;
    /**
     * - uint32
     */
    shardId: number;
    /**
     * - uint16
     */
    unknown3: number;
    /**
     * - uint16
     */
    unknown4: number;
    /**
     * - uint16
     */
    personaNameLength: number;
    /**
     * - string(16)
     */
    name: string;
};
export type InpsPersonaMapsMsgSchema = {
    /**
     * - uint16
     */
    msgNo: number;
    /**
     * - uint16
     */
    msgLength: number;
    /**
     * - uint16
     */
    msgVersion: number;
    /**
     * - uint16
     */
    reserved: number;
    /**
     * - uint16
     */
    msgChecksum: number;
    personas: InpsPersonaMapsPersonaRecord[];
};
/**
 * *
 */
export type MESSAGE_DIRECTION = string;
export namespace MESSAGE_DIRECTION {
    const RECEIVED: string;
    const SENT: string;
}
