// commId -> set of connectionIds in that channel
const channelMembers: Map<number, Set<string>> = new Map();
// connectionId -> set of commIds that connection has joined
const connectionChannels: Map<string, Set<number>> = new Map();
// connectionId -> userId (for relay target lookup)
const connectionUsers: Map<string, number> = new Map();
// userId -> connectionId (reverse index)
const userConnections: Map<number, string> = new Map();

export function joinChannel(connectionId: string, commId: number): void {
    if (!channelMembers.has(commId)) {
        channelMembers.set(commId, new Set());
    }
    channelMembers.get(commId)!.add(connectionId);

    if (!connectionChannels.has(connectionId)) {
        connectionChannels.set(connectionId, new Set());
    }
    connectionChannels.get(connectionId)!.add(commId);
}

export function leaveChannel(connectionId: string, commId: number): void {
    channelMembers.get(commId)?.delete(connectionId);
    connectionChannels.get(connectionId)?.delete(commId);
}

export function leaveAllChannels(connectionId: string): number[] {
    const comms = [...(connectionChannels.get(connectionId) ?? [])];
    for (const commId of comms) {
        channelMembers.get(commId)?.delete(connectionId);
    }
    connectionChannels.delete(connectionId);

    const userId = connectionUsers.get(connectionId);
    if (userId !== undefined) {
        userConnections.delete(userId);
        connectionUsers.delete(connectionId);
    }

    return comms;
}

export function getChannelMembers(commId: number): string[] {
    return [...(channelMembers.get(commId) ?? [])];
}

export function getConnectionChannels(connectionId: string): number[] {
    return [...(connectionChannels.get(connectionId) ?? [])];
}

export function setConnectionUserId(connectionId: string, userId: number): void {
    const existing = connectionUsers.get(connectionId);
    if (existing !== undefined && existing !== userId) {
        userConnections.delete(existing);
    }
    connectionUsers.set(connectionId, userId);
    userConnections.set(userId, connectionId);
}

export function getConnectionIdByUserId(userId: number): string | undefined {
    return userConnections.get(userId);
}

/** Clear all state — for use in tests only. */
export function _resetChannelMembership(): void {
    channelMembers.clear();
    connectionChannels.clear();
    connectionUsers.clear();
    userConnections.clear();
}
