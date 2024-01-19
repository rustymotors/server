export type UserSession = {
    customerId: number;
    token: string;
    connectionId: string;
    port: number;
    ipAddress: string;
    activeProfileId: number;
    nextSequenceNumber: number;
    sessionKey: string;
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
    };
    setUserSession(userSession);
    return userSession;
}
