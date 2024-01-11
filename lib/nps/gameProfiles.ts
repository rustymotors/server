export type GameProfile = {
    customerId: number;
    profileName: string;
    profileId: number;
    gameServerId: number;
};

export const gameProfiles = new Map<number, GameProfile>([]);

export function populateGameProfiles(
    profiles: Map<number, GameProfile>,
): void {}

export function getGameProfilesForCustomerId(
    customerId: number,
): GameProfile[] | undefined {
    const profiles: GameProfile[] = [];
    for (const profile of gameProfiles.values()) {
        if (profile.customerId === customerId) {
            profiles.push(profile);
        }
    }
    return profiles;
}

export function gameProfileExists(customerId: number): boolean {
    return gameProfiles.has(customerId);
}

export function addGameProfile(profile: GameProfile): void {
    gameProfiles.set(profile.customerId, profile);
}

export function deleteGameProfile(customerId: number): void {
    gameProfiles.delete(customerId);
}

export function createGameProfile(
    customerId: number,
    profileName: string,
    profileId: number,
    gameServerId: number,
): GameProfile {
    const profile = {
        customerId,
        profileName,
        profileId,
        gameServerId,
    };
    addGameProfile(profile);
    return profile;
}
