import { GameProfile } from "../messageStructs/GameProfile.js";

export const gameProfiles: GameProfile[] = [];

export function populateGameProfiles(profiles: GameProfile[]): void {
    const profile1 = GameProfile.new();
    profile1.customerId = 2;
    profile1.profileName = "molly";
    profile1.serverId = 1;
    profile1.createStamp = 0;
    profile1.lastLoginStamp = 0;
    profile1.numberGames = 0;
    profile1.profileId = 1;
    profile1.isOnline = false;
    profile1.gamePurchaseStamp = 0;
    profile1.gameSerialNumber = "";
    profile1.timeOnline = 0;
    profile1.timeInGame = 0;
    profile1.gameBlob = Buffer.alloc(0);
    profile1.personalBlob = Buffer.alloc(0);
    profile1.pictureBlob = Buffer.alloc(0);
    profile1.dnd = false;
    profile1.gameStartStamp = 0;
    profile1.currentKey = "";
    profile1.profileLevel = 0;
    profile1.shardId = 44;
    profiles.push(profile1);
}

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

export function gameProfileExists(profileName: string): boolean {
    for (const profile of gameProfiles.values()) {
        if (profile.profileName === profileName) {
            return true;
        }
    }
    return false;
}

export function addGameProfile(profile: GameProfile): void {
    gameProfiles.push(profile);
}

export function deleteGameProfile(profileId: number): void {
    for (const [index, profile] of gameProfiles.entries()) {
        if (profile.profileId === profileId) {
            gameProfiles.splice(index, 1);
            return;
        }
    }
}

export function createGameProfile(): GameProfile {
    const profile = GameProfile.new();

    addGameProfile(profile);
    return profile;
}
