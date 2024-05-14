import { getDatabase } from "database";
import { profile as profileSchema } from "schema";
import { GameProfile } from "../messageStructs/GameProfile.js";

export const gameProfiles: GameProfile[] = [];

export async function populateGameProfiles(
  profiles: GameProfile[]
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

  return Promise.resolve();
}

export function getGameProfilesForCustomerId(
  customerId: number
): GameProfile[] {
  const profiles: GameProfile[] = [];
  for (const profile of gameProfiles.values()) {
    if (profile.customerId === customerId) {
      profiles.push(profile);
    }
  }
  return profiles;
}

export function getCustomerId(profileId: number): number {
  for (const profile of gameProfiles.values()) {
    if (profile.profileId === profileId) {
      return profile.customerId;
    }
  }
  return -1;
}

export function gameProfileExists(profileName: string): boolean {
  for (const profile of gameProfiles.values()) {
    if (profile.profileName === profileName) {
      return true;
    }
  }
  return false;
}

export async function addGameProfile(profile: GameProfile): Promise<void> {
  await getDatabase()
    .insert(profileSchema)
    .values([
      {
        customerId: profile.customerId,
        profileName: profile.profileName,
        serverId: profile.serverId,
        createStamp: profile.createStamp,
        lastLoginStamp: profile.lastLoginStamp,
        numberGames: profile.numberGames,
        profileId: profile.profileId,
        isOnline: profile.isOnline,
        gamePurchaseStamp: profile.gamePurchaseStamp,
        gameSerialNumber: profile.gameSerialNumber,
        timeOnline: profile.timeOnline,
        timeInGame: profile.timeInGame,
        gameBlob: profile.gameBlob.toString(),
        personalBlob: profile.personalBlob.toString(),
        pictureBlob: profile.pictureBlob.toString(),
        dnd: profile.dnd,
        gameStartStamp: profile.gameStartStamp,
        currentKey: profile.currentKey,
        profileLevel: profile.profileLevel,
        shardId: profile.shardId,
      },
    ])
    .onConflictDoNothing();
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

  return profile;
}
