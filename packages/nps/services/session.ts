import {
    Cipher,
    Decipher,
    createCipheriv,
    createDecipheriv,
} from "node:crypto";

export type ClientVersion = "debug" | "release" | "unknown";

export type EncryptionSession = {
    connectionId: string;
    customerId: number;
    sessionKey: string;
    gameCipher: Cipher;
    gameDecipher: Decipher;
};

export const encryptionSessions = new Map<string, EncryptionSession>([]);

export async function setEncryptionSession(
    encryptionSession: EncryptionSession,
): Promise<void> {
    encryptionSessions.set(encryptionSession.connectionId, encryptionSession);
}

export async function getEncryptionSession(
    connectionId: string,
): Promise<EncryptionSession | undefined> {
    if (encryptionSessions.has(connectionId)) {
        return encryptionSessions.get(connectionId);
    }
    return undefined;
}

export async function deleteEncryptionSession(
    connectionId: string,
): Promise<void> {
    encryptionSessions.delete(connectionId);
}

export async function newEncryptionSession({
    connectionId,
    customerId,
    sessionKey,
}: {
    connectionId: string;
    customerId: number;
    sessionKey: string;
}): Promise<EncryptionSession> {
    const gameCipher = createCipheriv(
        "des-cbc",
        Buffer.from(sessionKey, "hex"),
        Buffer.alloc(8),
    );
    gameCipher.setAutoPadding(false);
    const gameDecipher = createDecipheriv(
        "des-cbc",
        Buffer.from(sessionKey, "hex"),
        Buffer.alloc(8),
    );
    gameDecipher.setAutoPadding(false);
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

export async function setUserSession(userSession: UserSession): Promise<void> {
    userSessions.set(userSession.token, userSession);
}

export async function getUserSession(
    token: string,
): Promise<UserSession | undefined> {
    if (userSessions.has(token)) {
        return userSessions.get(token);
    }
    return undefined;
}

export async function deleteUserSession(token: string): Promise<void> {
    userSessions.delete(token);
}

export async function getUserSessionByConnectionId(
    connectionId: string,
): Promise<UserSession | undefined> {
    for (const userSession of userSessions.values()) {
        if (userSession.connectionId === connectionId) {
            return userSession;
        }
    }
    return undefined;
}

export async function getUserSessionByProfileId(
    profileId: number,
): Promise<UserSession | undefined> {
    for (const userSession of userSessions.values()) {
        if (userSession.activeProfileId === profileId) {
            return userSession;
        }
    }
    return undefined;
}

export async function getUserSessionByCustomerId(
    customerId: number,
): Promise<UserSession | undefined> {
    for (const userSession of userSessions.values()) {
        if (userSession.customerId === customerId) {
            return userSession;
        }
    }
    return undefined;
}

export async function getUserSessionByIPAndPort(
    ipAddress: string,
    port: number,
): Promise<UserSession | undefined> {
    for (const userSession of userSessions.values()) {
        if (userSession.ipAddress === ipAddress && userSession.port === port) {
            return userSession;
        }
    }
    return undefined;
}

export async function createNewUserSession({
    customerId,
    token,
    connectionId,
    port,
    ipAddress,
    activeProfileId,
    nextSequenceNumber,
    sessionKey,
    clientVersion,
}: UserSession): Promise<UserSession> {
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
