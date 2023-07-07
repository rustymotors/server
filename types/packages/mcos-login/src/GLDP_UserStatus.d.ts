/// <reference types="node" />
import { ISerializedObject } from "mcos/shared/interfaces";
import { SerializerBase } from "../../../src/shared/SerializerBase.js";
export declare class GLD_UserAction extends SerializerBase implements ISerializedObject {
}
export declare class GLDP_UserStatus extends SerializerBase implements ISerializedObject {
    _ban: boolean;
    _gag: boolean;
    _customerId: string;
    _personaId: string;
    _isCached: boolean;
    _sessionKey: string;
    constructor();
    getCustomerId(): string;
    isBanned(): boolean;
    isGagged(): boolean;
    getSessionKey(): string;
    getMetricsId(): string;
    serializeSize(): number;
    static deserialize(inputBuffer: Buffer): SerializerBase;
    private _doDeserialize;
}
