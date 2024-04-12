import { GameProfile } from "../messageStructs/GameProfile.js";

export const gameProfiles: GameProfile[] = [];

export async function populateGameProfiles(
    profiles: GameProfile[],
): Promise<void> {
    const profile1 = GameProfile.new();
    profile1.customerId = 2;
    profile1.profileName = "molly";
    profile1.serverId = 1;
    profile1.createStamp = 0;
    profile1.lastLoginStamp = 0;
    profile1.numberGames = 0;
    profile1.profileId = 1000;
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

export async function getGameProfilesForCustomerId(
    customerId: number,
): Promise<GameProfile[]> {
    const profiles: GameProfile[] = [];
    for (const profile of gameProfiles) {
        if (profile.customerId === customerId) {
            profiles.push(profile);
        }
    }
    return profiles;
}

export async function gameProfileExists(profileName: string): Promise<boolean> {
    return gameProfiles.some((profile) => profile.profileName === profileName);
}

export async function addGameProfile(profile: GameProfile): Promise<void> {
    gameProfiles.push(profile);
}

export async function deleteGameProfile(profileId: number): Promise<void> {
    gameProfiles.splice(
        gameProfiles.findIndex((profile) => profile.profileId === profileId),
        1,
    );
}

export async function createGameProfile(): Promise<GameProfile> {
    const profile = GameProfile.new();

    addGameProfile(profile);
    return profile;
}
