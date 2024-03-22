/// <reference types="node" />
import { NPSHeader, NPSMessage } from "@rustymotors/shared";
/**
 *
 * This is type UserGameData
 */
export declare class PersonaRecord {
    customerId: number;
    personaName: string;
    serverDataId: number;
    createDate: number;
    lastLogin: number;
    numberOfGames: number;
    personaId: number;
    isOnline: number;
    purchaseTimestamp: number;
    gameSerialNumber: string;
    timeOnline: number;
    timeInGame: number;
    extraData: Buffer;
    personaData: Buffer;
    pictureData: Buffer;
    dnd: number;
    startedPlayingTimestamp: number;
    hashedKey: string;
    personaLevel: number;
    shardId: number;
    constructor();
    /**
     *
     * @param {Buffer} buffer
     * @returns {PersonaRecord}
     */
    deserialize(buffer: Buffer): PersonaRecord;
    /**
     *
     * @returns {Buffer}
     */
    serialize(): Buffer;
    static size(): number;
    toJSON(): {
        customerId: number;
        personaId: number;
        personaName: string;
        shardId: number;
        serverDataId: number;
    };
    asJSON(): {
        customerId: number;
        personaId: number;
        personaName: string;
        shardId: number;
        serverDataId: number;
    };
    toString(): string;
}
export declare class PersonaList {
    _personaRecords: PersonaRecord[];
    constructor();
    /**
     *
     * @param {Buffer} buffer
     * @returns {PersonaList}
     */
    deserialize(buffer: Buffer): PersonaList;
    /**
     *
     * @returns {Buffer}
     */
    serialize(): Buffer;
    /**
     * @param {PersonaRecord} personaRecord
     */
    addPersonaRecord(personaRecord: PersonaRecord): void;
    personaCount(): number;
    size(): number;
    asJSON(): {
        personaRecords: PersonaRecord[];
    };
    toString(): string;
}
export declare class PersonaMapsMessage extends NPSMessage {
    _personaRecords: PersonaList | undefined;
    raw: Buffer | undefined;
    constructor();
    /**
     * @param {Buffer} buffer
     * @returns {PersonaMapsMessage}
     */
    deserialize(buffer: Buffer): PersonaMapsMessage;
    /**
     * @returns {Buffer}
     */
    serialize(): Buffer;
    asJSON(): {
        header: NPSHeader;
        personaRecords: PersonaList | undefined;
    };
    toString(): string;
}
