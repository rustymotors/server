type TunableType = Record<string, number> & {
    clubCreationFee: number;
    clubCreationMinimumLevel: number;
    clubOfficerMinimumLevel: number;
    racePPDefeatedOpponent: number;
    racePPPlaceLost: number;
    racePenaltyPerRank: number;
    raceBonusPerRank: number;
    raceBonusPerMileSponsored: number;
    raceBonusPerMileOpen: number;
    levelsTunelog: number;
    levelsSlope: number;
    levelsOffset: number;
    maxEZStreetLevel: number;
    clubWaitPeriodBetweenClubs: number;
    turfwarCaptionBonus: number;
    turfwarMemberBonus: number;
    topDogBonus: number;
    rankAdvancementBonus: number;
    ttCashRewardFirst: number;
    ttCashRewardSecond: number;
    ttCashRewardThird: number;
    ttPointsRewardFirst: number;
    ttPointsRewardSecond: number;
    ttPointsRewardThird: number;
    universalRepairCostModifier: number;
    universalScrapValueModifier: number;
    adCost1Day: number;
    adCost2Days: number;
    adCost3Days: number;
    adCost4Days: number;
    adCost5Days: number;
    adCost6Days: number;
    adCost7Days: number;
    tradeInModifier: number;
    simStreetMaxWager: number;
    pointAward1stPlace: number;
    pointAward2ndPlace: number;
    pointAward3rdPlace: number;
    pointAward4thPlace: number;
    pointAward5thPlace: number;
    pointAward6thPlace: number;
    arcadeRacePointModifier: number;
    mcotsPoolingFrequency: number;
    starterCash: number;
    enableCheatEmails: number;
    salaryPerLevel: number;
    clubMaxMembers: number;
    clubRegistrationFee: number;
    clubReRegistrationFee: number;
    classifiedAdBillRate: number;
    classifiedAdMaxDays: number;
    classifiedAdMaxSize: number;
    papAwardPercentage: number;
    dealOfTheDayBrandedPartId: number;
    dealOfTheDayDiscount: number;
};

/**
 * Represents a class that holds tunable values for a game.
 * This class follows the Singleton design pattern.
 */
class Tunables {
    private static instance: Tunables;
    private tunables: TunableType = {
        clubCreationFee: 5000,
        clubCreationMinimumLevel: 10,
        clubOfficerMinimumLevel: 10,
        racePPDefeatedOpponent: 5,
        racePPPlaceLost: 1,
        racePenaltyPerRank: 5,
        raceBonusPerRank: 5,
        raceBonusPerMileSponsored: 1,
        raceBonusPerMileOpen: 1,
        levelsTunelog: 100,
        levelsSlope: 1,
        levelsOffset: 0,
        maxEZStreetLevel: 100,
        clubWaitPeriodBetweenClubs: 7,
        turfwarCaptionBonus: 500,
        turfwarMemberBonus: 100,
        topDogBonus: 1000,
        rankAdvancementBonus: 100,
        ttCashRewardFirst: 1000,
        ttCashRewardSecond: 500,
        ttCashRewardThird: 250,
        ttPointsRewardFirst: 100,
        ttPointsRewardSecond: 50,
        ttPointsRewardThird: 25,
        universalRepairCostModifier: 100,
        universalScrapValueModifier: 100,
        adCost1Day: 100,
        adCost2Days: 200,
        adCost3Days: 300,
        adCost4Days: 400,
        adCost5Days: 500,
        adCost6Days: 600,
        adCost7Days: 700,
        tradeInModifier: 100,
        simStreetMaxWager: 100,
        pointAward1stPlace: 100,
        pointAward2ndPlace: 75,
        pointAward3rdPlace: 50,
        pointAward4thPlace: 25,
        pointAward5thPlace: 10,
        pointAward6thPlace: 5,
        arcadeRacePointModifier: 100,
        mcotsPoolingFrequency: 100,
        starterCash: 1000,
        enableCheatEmails: 1,
        salaryPerLevel: 100,
        clubMaxMembers: 10,
        clubRegistrationFee: 1000,
        clubReRegistrationFee: 500,
        classifiedAdBillRate: 100,
        classifiedAdMaxDays: 7,
        classifiedAdMaxSize: 100,
        papAwardPercentage: 10,
        dealOfTheDayBrandedPartId: 0,
        dealOfTheDayDiscount: 0,
    };

    private constructor() {
        this.initializeTunables();
    }

    public static getInstance(): Tunables {
        if (!Tunables.instance) {
            Tunables.instance = new Tunables();
        }

        return Tunables.instance;
    }

    private initializeTunables(): void {
        this.tunables = {
            clubCreationFee: 5000,
            clubCreationMinimumLevel: 10,
            clubOfficerMinimumLevel: 10,
            racePPDefeatedOpponent: 5,
            racePPPlaceLost: 1,
            racePenaltyPerRank: 5,
            raceBonusPerRank: 5,
            raceBonusPerMileSponsored: 1,
            raceBonusPerMileOpen: 1,
            levelsTunelog: 100,
            levelsSlope: 1,
            levelsOffset: 0,
            maxEZStreetLevel: 100,
            clubWaitPeriodBetweenClubs: 7,
            turfwarCaptionBonus: 500,
            turfwarMemberBonus: 100,
            topDogBonus: 1000,
            rankAdvancementBonus: 100,
            ttCashRewardFirst: 1000,
            ttCashRewardSecond: 500,
            ttCashRewardThird: 250,
            ttPointsRewardFirst: 100,
            ttPointsRewardSecond: 50,
            ttPointsRewardThird: 25,
            universalRepairCostModifier: 100,
            universalScrapValueModifier: 100,
            adCost1Day: 100,
            adCost2Days: 200,
            adCost3Days: 300,
            adCost4Days: 400,
            adCost5Days: 500,
            adCost6Days: 600,
            adCost7Days: 700,
            tradeInModifier: 100,
            simStreetMaxWager: 100,
            pointAward1stPlace: 100,
            pointAward2ndPlace: 75,
            pointAward3rdPlace: 50,
            pointAward4thPlace: 25,
            pointAward5thPlace: 10,
            pointAward6thPlace: 5,
            arcadeRacePointModifier: 100,
            mcotsPoolingFrequency: 100,
            starterCash: 1000,
            enableCheatEmails: 1,
            salaryPerLevel: 100,
            clubMaxMembers: 10,
            clubRegistrationFee: 1000,
            clubReRegistrationFee: 500,
            classifiedAdBillRate: 100,
            classifiedAdMaxDays: 7,
            classifiedAdMaxSize: 100,
            papAwardPercentage: 10,
            dealOfTheDayBrandedPartId: 0,
            dealOfTheDayDiscount: 0,
        };
    }

    public getTunable(name: string): number {
        if (this.tunables[name] === undefined) {
            throw new Error(`Tunable ${name} not found`);
        }

        return this.tunables[name];
    }

    public setTunable(name: string, value: number): void {
        if (this.tunables[name] === undefined) {
            throw new Error(`Tunable ${name} not found`);
        }

        this.tunables[name] = value;
    }
}

/**
 * Retrieves the tunables from the database.
 *
 * @returns The tunables object.
 */
export function getTunables(): Tunables {
    return Tunables.getInstance();
}
