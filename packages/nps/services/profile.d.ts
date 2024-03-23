import { GameProfile } from "../messageStructs/GameProfile.js";
export declare const gameProfiles: GameProfile[];
export declare function populateGameProfiles(
    profiles: GameProfile[],
): Promise<void>;
export declare function getGameProfilesForCustomerId(
    customerId: number,
): Promise<GameProfile[]>;
export declare function gameProfileExists(
    profileName: string,
): Promise<boolean>;
export declare function addGameProfile(profile: GameProfile): Promise<void>;
export declare function deleteGameProfile(profileId: number): Promise<void>;
export declare function createGameProfile(): Promise<GameProfile>;
