import { Cipher, Decipher, createCipheriv } from "node:crypto";

export type ClientVersion = "debug" | "release" | "unknown";

export type EncryptionSession = {
    connectionId: string;
    customerId: number;
    sessionKey: string;
    gameCipher: Cipher;
    gameDecipher: Decipher;
};

export const encryptionSessions = new Map<string, EncryptionSession>([]);

export function setEncryptionSession(
    encryptionSession: EncryptionSession,
): void {
    encryptionSessions.set(encryptionSession.connectionId, encryptionSession);
}

export function getEncryptionSession(
    connectionId: string,
): EncryptionSession | undefined {
    if (encryptionSessions.has(connectionId)) {
        return encryptionSessions.get(connectionId);
    }
    return undefined;
}

export function deleteEncryptionSession(connectionId: string): void {
    encryptionSessions.delete(connectionId);
}

export function newEncryptionSession({
    connectionId,
    customerId,
    sessionKey,
}: {
    connectionId: string;
    customerId: number;
    sessionKey: string;
}): EncryptionSession {
    const gameCipher = createCipheriv(
        "des-cbc",
        Buffer.from(sessionKey, "hex"),
        Buffer.alloc(8),
    );
    const gameDecipher = createCipheriv(
        "des-cbc",
        Buffer.from(sessionKey, "hex"),
        Buffer.alloc(8),
    );

    const encryptionSession = {
        connectionId,
        customerId,
        sessionKey,
        gameCipher,
        gameDecipher,
    };
    setEncryptionSession(encryptionSession);
    return encryptionSession;
}

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

export const userSessions = new Map<string, UserSession>([]);

export function setUserSession(userSession: UserSession): void {
    userSessions.set(userSession.token, userSession);
}

export function getUserSession(token: string): UserSession | undefined {
    if (userSessions.has(token)) {
        return userSessions.get(token);
    }
    return undefined;
}

export function deleteUserSession(token: string): void {
    userSessions.delete(token);
}

export function deleteAllUserSessions(): void {
    userSessions.clear();
}

export function getUserSessionByConnectionId(
    connectionId: string,
): UserSession | undefined {
    for (const userSession of userSessions.values()) {
        if (userSession.connectionId === connectionId) {
            return userSession;
        }
    }
    return undefined;
}

export function getUserSessionByProfileId(
    profileId: number,
): UserSession | undefined {
    for (const userSession of userSessions.values()) {
        if (userSession.activeProfileId === profileId) {
            return userSession;
        }
    }
    return undefined;
}

export function getUserSessionByCustomerId(
    customerId: number,
): UserSession | undefined {
    for (const userSession of userSessions.values()) {
        if (userSession.customerId === customerId) {
            return userSession;
        }
    }
    return undefined;
}

export function getUserSessionByIPAndPort(
    ipAddress: string,
    port: number,
): UserSession | undefined {
    for (const userSession of userSessions.values()) {
        if (userSession.ipAddress === ipAddress && userSession.port === port) {
            return userSession;
        }
    }
    return undefined;
}

export function createNewUserSession({
    customerId,
    token,
    connectionId,
    port,
    ipAddress,
    activeProfileId,
    nextSequenceNumber,
    sessionKey,
    clientVersion,
}: UserSession): UserSession {
    const userSession = {
        customerId,
        token,
        connectionId,
        port,
        ipAddress,
        activeProfileId,
        nextSequenceNumber,
        sessionKey,
        clientVersion,
    };
    setUserSession(userSession);
    return userSession;
}
