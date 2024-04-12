/// <reference types="node" />
import { SerializedBuffer, OldServerMessage } from "rusty-shared";
export declare class ListEntry extends SerializedBuffer {
    constructor();
}
export declare class LoginCompleteMessage extends SerializedBuffer {
    _msgNo: number;
    _serverTime: number;
    _firstTime: boolean;
    _paycheckWaiting: boolean;
    _clubInvitesWaiting: boolean;
    tallyInProgress: boolean;
    _secondsUntilShutdown: number;
    _shardGNP: number;
    _shardCarsSold: number;
    _shardAverageSalaries: number;
    _shardAverageCarsOwned: number;
    _shardAverageLevel: number;
    constructor();
    serialize(): Buffer;
    size(): number;
    toString(): string;
}
export declare class TLoginMessage extends OldServerMessage {
    _size: number;
    _customerId: number;
    _personaId: number;
    _lotOwnerId: number;
    _brandedPartId: number;
    _skinId: number;
    _personaName: string;
    _mcVersion: string;
    constructor();
    /**
     * @param {Buffer} buffer
     */
    deserialize(buffer: Buffer): void;
    serialize(): Buffer;
    asJSON(): {
        msgNo: number;
        customerId: number;
        personaId: number;
        lotOwnerId: number;
        brandedPartId: number;
        skinId: number;
        personaName: string;
        mcVersion: string;
    };
    toString(): string;
}
