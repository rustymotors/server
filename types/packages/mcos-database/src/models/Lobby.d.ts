/// <reference types="node" />
import { ISerializedObject } from "mcos/shared/interfaces";
import { SerializerBase } from "mcos/shared";
export declare class LobbyModel extends SerializerBase implements ISerializedObject {
    deserialize(_inputBuffer: Buffer): LobbyModel;
    serialize(): Buffer;
    serializeSize(): number;
    static schema: string;
}
