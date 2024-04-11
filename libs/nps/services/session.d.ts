/// <reference types="node" />
import { Cipher, Decipher } from "node:crypto";
export type ClientVersion = "debug" | "release" | "unknown";
export type EncryptionSession = {
    connectionId: string;
    customerId: number;
    sessionKey: string;
    gameCipher: Cipher;
    gameDecipher: Decipher;
};
export declare const encryptionSessions: Map<string, EncryptionSession>;
export declare function setEncryptionSession(
    encryptionSession: EncryptionSession,
): Promise<void>;
export declare function getEncryptionSession(
    connectionId: string,
): Promise<EncryptionSession | undefined>;
export declare function deleteEncryptionSession(
    connectionId: string,
): Promise<void>;
export declare function newEncryptionSession({
    connectionId,
    customerId,
    sessionKey,
}: {
    connectionId: string;
    customerId: number;
    sessionKey: string;
}): Promise<EncryptionSession>;
export type UserSession = {
    customerId: number;
    token: string;
    connectionId: string;
    port: number;
    ipAddress: string;
    activeProfileId: number;
    nextSequenceNumber: number;
    sessionKey: string;
    clientVersion: ClientVersion;
};
export declare const userSessions: Map<string, UserSession>;
export declare function setUserSession(userSession: UserSession): Promise<void>;
export declare function getUserSession(
    token: string,
): Promise<UserSession | undefined>;
export declare function deleteUserSession(token: string): Promise<void>;
export declare function getUserSessionByConnectionId(
    connectionId: string,
): Promise<UserSession | undefined>;
export declare function getUserSessionByProfileId(
    profileId: number,
): Promise<UserSession | undefined>;
export declare function getUserSessionByCustomerId(
    customerId: number,
): Promise<UserSession | undefined>;
export declare function getUserSessionByIPAndPort(
    ipAddress: string,
    port: number,
): Promise<UserSession | undefined>;
export declare function createNewUserSession({
    customerId,
    token,
    connectionId,
    port,
    ipAddress,
    activeProfileId,
    nextSequenceNumber,
    sessionKey,
    clientVersion,
}: UserSession): Promise<UserSession>;
