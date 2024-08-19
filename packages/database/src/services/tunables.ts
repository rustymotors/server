class Tunables {
    private static instance: Tunables;
    private clubCreationFee: number;
    private clubCreationMinimumLevel: number;
    private clubOfficerMinimumLevel: number;
    private racePPDefeatedOpponent: number;
    private racePPPlaceLost: number;
    private racePenaltyPerRank: number;
    private raceBonusPerRank: number;
    private raceBonusPerMileSponsored: number;
    private raceBonusPerMileOpen: number;
    private levelsTunelog: number;
    private levelsSlope: number;
    private levelsOffset: number;
    private maxEZStreetLevel: number;
    private clubWaitPeriodBetweenClubs: number;
    private turfwarCaptionBonus: number;
    private turfwarMemberBonus: number;
    private topDogBonus: number;
    private rankAdvancementBonus: number;
    private ttCashRewardFirst: number;
    private ttCashRewardSecond: number;
    private ttCashRewardThird: number;
    private ttPointsRewardFirst: number;
    private ttPointsRewardSecond: number;
    private ttPointsRewardThird: number;
    private universalRepairCostModifier: number;
    private universalScrapValueModifier: number;
    private adCost1Day: number;
    private adCost2Days: number;
    private adCost3Days: number;
    private adCost4Days: number;
    private adCost5Days: number;
    private adCost6Days: number;
    private adCost7Days: number;
    private tradeInModifier: number;
    private simStreetMaxWager: number;
    private pointAward1stPlace: number;
    private pointAward2ndPlace: number;
    private pointAward3rdPlace: number;
    private pointAward4thPlace: number;
    private pointAward5thPlace: number;
    private pointAward6thPlace: number;
    private arcadeRacePointModifier: number;
    private mcotsPoolingFrequency: number;
    private starterCash: number;
    private enableCheatEmails: number;
    private salaryPerLevel: number;
    private clubMaxMembers: number;
    private clubRegistrationFee: number;
    private clubReRegistrationFee: number;
    private classifiedAdBillRate: number;
    private classifiedAdMaxDays: number;
    private classifiedAdMaxSize: number;
    private papAwardPercentage: number;
    private dealOfTheDayBrandedPartId: number;
    private dealOfTheDayDiscount: number;

    private constructor() {
        this.clubCreationFee = 5000;
        this.clubCreationMinimumLevel = 10;
        this.clubOfficerMinimumLevel = 10;
        this.racePPDefeatedOpponent = 5;
        this.racePPPlaceLost = 1;
        this.racePenaltyPerRank = 5;
        this.raceBonusPerRank = 5;
        this.raceBonusPerMileSponsored = 1;
        this.raceBonusPerMileOpen = 1;
        this.levelsTunelog = 100;
        this.levelsSlope = 1;
        this.levelsOffset = 0;
        this.maxEZStreetLevel = 100;
        this.clubWaitPeriodBetweenClubs = 7;
        this.turfwarCaptionBonus = 500;
        this.turfwarMemberBonus = 100;
        this.topDogBonus = 1000;
        this.rankAdvancementBonus = 100;
        this.ttCashRewardFirst = 1000;
        this.ttCashRewardSecond = 500;
        this.ttCashRewardThird = 250;
        this.ttPointsRewardFirst = 100;
        this.ttPointsRewardSecond = 50;
        this.ttPointsRewardThird = 25;
        this.universalRepairCostModifier = 100;
        this.universalScrapValueModifier = 100;
        this.adCost1Day = 100;
        this.adCost2Days = 200;
        this.adCost3Days = 300;
        this.adCost4Days = 400;
        this.adCost5Days = 500;
        this.adCost6Days = 600;
        this.adCost7Days = 700;
        this.tradeInModifier = 100;
        this.simStreetMaxWager = 100;
        this.pointAward1stPlace = 100;
        this.pointAward2ndPlace = 75;
        this.pointAward3rdPlace = 50;
        this.pointAward4thPlace = 25;
        this.pointAward5thPlace = 10;
        this.pointAward6thPlace = 5;
        this.arcadeRacePointModifier = 100;
        this.mcotsPoolingFrequency = 100;
        this.starterCash = 1000;
        this.enableCheatEmails = 1;
        this.salaryPerLevel = 100;
        this.clubMaxMembers = 10;
        this.clubRegistrationFee = 1000;
        this.clubReRegistrationFee = 500;
        this.classifiedAdBillRate = 100;
        this.classifiedAdMaxDays = 7;
        this.classifiedAdMaxSize = 100;
        this.papAwardPercentage = 10;
        this.dealOfTheDayBrandedPartId = 0;
        this.dealOfTheDayDiscount = 0;
    }

    public static getInstance(): Tunables {
        if (!Tunables.instance) {
            Tunables.instance = new Tunables();
        }

        return Tunables.instance;
    }

    public getClubCreationFee(): number {
        return this.clubCreationFee;
    }

    public getClubCreationMinimumLevel(): number {
        return this.clubCreationMinimumLevel;
    }

    public getClubOfficerMinimumLevel(): number {
        return this.clubOfficerMinimumLevel;
    }

    public getRacePPDefeatedOpponent(): number {
        return this.racePPDefeatedOpponent;
    }

    public getRacePPPlaceLost(): number {
        return this.racePPPlaceLost;
    }

    public getRacePenaltyPerRank(): number {
        return this.racePenaltyPerRank;
    }

    public getRaceBonusPerRank(): number {
        return this.raceBonusPerRank;
    }

    public getRaceBonusPerMileSponsored(): number {
        return this.raceBonusPerMileSponsored;
    }

    public getRaceBonusPerMileOpen(): number {
        return this.raceBonusPerMileOpen;
    }

    public getLevelsTunelog(): number {
        return this.levelsTunelog;
    }

    public getLevelsSlope(): number {
        return this.levelsSlope;
    }

    public getLevelsOffset(): number {
        return this.levelsOffset;
    }

    public getMaxEZStreetLevel(): number {
        return this.maxEZStreetLevel;
    }

    public getClubWaitPeriodBetweenClubs(): number {
        return this.clubWaitPeriodBetweenClubs;
    }

    public getTurfwarCaptionBonus(): number {
        return this.turfwarCaptionBonus;
    }

    public getTurfwarMemberBonus(): number {
        return this.turfwarMemberBonus;
    }

    public getTopDogBonus(): number {
        return this.topDogBonus;
    }

    public getRankAdvancementBonus(): number {
        return this.rankAdvancementBonus;
    }

    public getTtCashRewardFirst(): number {
        return this.ttCashRewardFirst;
    }

    public getTtCashRewardSecond(): number {
        return this.ttCashRewardSecond;
    }

    public getTtCashRewardThird(): number {
        return this.ttCashRewardThird;
    }

    public getTtPointsRewardFirst(): number {
        return this.ttPointsRewardFirst;
    }

    public getTtPointsRewardSecond(): number {
        return this.ttPointsRewardSecond;
    }

    public getTtPointsRewardThird(): number {
        return this.ttPointsRewardThird;
    }

    public getUniversalRepairCostModifier(): number {
        return this.universalRepairCostModifier;
    }

    public getUniversalScrapValueModifier(): number {
        return this.universalScrapValueModifier;
    }

    public getAdCost1Day(): number {
        return this.adCost1Day;
    }

    public getAdCost2Days(): number {
        return this.adCost2Days;
    }

    public getAdCost3Days(): number {
        return this.adCost3Days;
    }

    public getAdCost4Days(): number {
        return this.adCost4Days;
    }

    public getAdCost5Days(): number {
        return this.adCost5Days;
    }

    public getAdCost6Days(): number {
        return this.adCost6Days;
    }

    public getAdCost7Days(): number {
        return this.adCost7Days;
    }

    public getTradeInModifier(): number {
        return this.tradeInModifier;
    }

    public getSimStreetMaxWager(): number {
        return this.simStreetMaxWager;
    }

    public getPointAward1stPlace(): number {
        return this.pointAward1stPlace;
    }

    public getPointAward2ndPlace(): number {
        return this.pointAward2ndPlace;
    }

    public getPointAward3rdPlace(): number {
        return this.pointAward3rdPlace;
    }

    public getPointAward4thPlace(): number {
        return this.pointAward4thPlace;
    }

    public getPointAward5thPlace(): number {
        return this.pointAward5thPlace;
    }

    public getPointAward6thPlace(): number {
        return this.pointAward6thPlace;
    }

    public getArcadeRacePointModifier(): number {
        return this.arcadeRacePointModifier;
    }

    public getMcotsPoolingFrequency(): number {
        return this.mcotsPoolingFrequency;
    }

    public getStarterCash(): number {
        return this.starterCash;
    }

    public getEnableCheatEmails(): number {
        return this.enableCheatEmails;
    }

    public getSalaryPerLevel(): number {
        return this.salaryPerLevel;
    }

    public getClubMaxMembers(): number {
        return this.clubMaxMembers;
    }

    public getClubRegistrationFee(): number {
        return this.clubRegistrationFee;
    }

    public getClubReRegistrationFee(): number {
        return this.clubReRegistrationFee;
    }

    public getClassifiedAdBillRate(): number {
        return this.classifiedAdBillRate;
    }

    public getClassifiedAdMaxDays(): number {
        return this.classifiedAdMaxDays;
    }

    public getClassifiedAdMaxSize(): number {
        return this.classifiedAdMaxSize;
    }

    public getPapAwardPercentage(): number {
        return this.papAwardPercentage;
    }

    public getDealOfTheDayBrandedPartId(): number {
        return this.dealOfTheDayBrandedPartId;
    }

    public getDealOfTheDayDiscount(): number {
        return this.dealOfTheDayDiscount;
    }

    public setClubCreationFee(clubCreationFee: number): void {
        this.clubCreationFee = clubCreationFee;
    }

    public setClubCreationMinimumLevel(clubCreationMinimumLevel: number): void {
        this.clubCreationMinimumLevel = clubCreationMinimumLevel;
    }

    public setClubOfficerMinimumLevel(clubOfficerMinimumLevel: number): void {
        this.clubOfficerMinimumLevel = clubOfficerMinimumLevel;
    }

    public setRacePPDefeatedOpponent(racePPDefeatedOpponent: number): void {
        this.racePPDefeatedOpponent = racePPDefeatedOpponent;
    }

    public setRacePPPlaceLost(racePPPlaceLost: number): void {
        this.racePPPlaceLost = racePPPlaceLost;
    }

    public setRacePenaltyPerRank(racePenaltyPerRank: number): void {
        this.racePenaltyPerRank = racePenaltyPerRank;
    }

    public setRaceBonusPerRank(raceBonusPerRank: number): void {
        this;
    }

    public setRaceBonusPerMileSponsored(
        raceBonusPerMileSponsored: number
    ): void {
        this.raceBonusPerMileSponsored = raceBonusPerMileSponsored;
    }

    public setRaceBonusPerMileOpen(raceBonusPerMileOpen: number): void {
        this.raceBonusPerMileOpen = raceBonusPerMileOpen;
    }

    public setLevelsTunelog(levelsTunelog: number): void {
        this.levelsTunelog = levelsTunelog;
    }

    public setLevelsSlope(levelsSlope: number): void {
        this.levelsSlope = levelsSlope;
    }

    public setLevelsOffset(levelsOffset: number): void {
        this.levelsOffset = levelsOffset;
    }

    public setMaxEZStreetLevel(maxEZStreetLevel: number): void {
        this.maxEZStreetLevel = maxEZStreetLevel;
    }

    public setClubWaitPeriodBetweenClubs(
        clubWaitPeriodBetweenClubs: number
    ): void {
        this.clubWaitPeriodBetweenClubs = clubWaitPeriodBetweenClubs;
    }

    public setTurfwarCaptionBonus(turfwarCaptionBonus: number): void {
        this.turfwarCaptionBonus = turfwarCaptionBonus;
    }

    public setTurfwarMemberBonus(turfwarMemberBonus: number): void {
        this.turfwarMemberBonus = turfwarMemberBonus;
    }

    public setTopDogBonus(topDogBonus: number): void {
        this.topDogBonus = topDogBonus;
    }

    public setRankAdvancementBonus(rankAdvancementBonus: number): void {
        this.rankAdvancementBonus = rankAdvancementBonus;
    }

    public setTtCashRewardFirst(ttCashRewardFirst: number): void {
        this.ttCashRewardFirst = ttCashRewardFirst;
    }

    public setTtCashRewardSecond(ttCashRewardSecond: number): void {
        this.ttCashRewardSecond = ttCashRewardSecond;
    }

    public setTtCashRewardThird(ttCashRewardThird: number): void {
        this.ttCashRewardThird = ttCashRewardThird;
    }

    public setTtPointsRewardFirst(ttPointsRewardFirst: number): void {
        this.ttPointsRewardFirst = ttPointsRewardFirst;
    }

    public setTtPointsRewardSecond(ttPointsRewardSecond: number): void {
        this.ttPointsRewardSecond = ttPointsRewardSecond;
    }

    public setTtPointsRewardThird(ttPointsRewardThird: number): void {
        this.ttPointsRewardThird = ttPointsRewardThird;
    }

    public setUniversalRepairCostModifier(
        universalRepairCostModifier: number
    ): void {
        this.universalRepairCostModifier = universalRepairCostModifier;
    }

    public setUniversalScrapValueModifier(
        universalScrapValueModifier: number
    ): void {
        this.universalScrapValueModifier = universalScrapValueModifier;
    }

    public setAdCost1Day(adCost1Day: number): void {
        this.adCost1Day = adCost1Day;
    }

    public setAdCost2Days(adCost2Days: number): void {
        this.adCost2Days = adCost2Days;
    }

    public setAdCost3Days(adCost3Days: number): void {
        this.adCost3Days = adCost3Days;
    }

    public setAdCost4Days(adCost4Days: number): void {
        this.adCost4Days = adCost4Days;
    }

    public setAdCost5Days(adCost5Days: number): void {
        this.adCost5Days = adCost5Days;
    }

    public setAdCost6Days(adCost6Days: number): void {
        this.adCost6Days = adCost6Days;
    }

    public setAdCost7Days(adCost7Days: number): void {
        this.adCost7Days = adCost7Days;
    }

    public setTradeInModifier(tradeInModifier: number): void {
        this.tradeInModifier = tradeInModifier;
    }

    public setSimStreetMaxWager(simStreetMaxWager: number): void {
        this.simStreetMaxWager = simStreetMaxWager;
    }

    public setPointAward1stPlace(pointAward1stPlace: number): void {
        this.pointAward1stPlace = pointAward1stPlace;
    }

    public setPointAward2ndPlace(pointAward2ndPlace: number): void {
        this.pointAward2ndPlace = pointAward2ndPlace;
    }

    public setPointAward3rdPlace(pointAward3rdPlace: number): void {
        this.pointAward3rdPlace = pointAward3rdPlace;
    }

    public setPointAward4thPlace(pointAward4thPlace: number): void {
        this.pointAward4thPlace = pointAward4thPlace;
    }

    public setPointAward5thPlace(pointAward5thPlace: number): void {
        this.pointAward5thPlace = pointAward5thPlace;
    }

    public setPointAward6thPlace(pointAward6thPlace: number): void {
        this.pointAward6thPlace = pointAward6thPlace;
    }

    public setArcadeRacePointModifier(arcadeRacePointModifier: number): void {
        this.arcadeRacePointModifier = arcadeRacePointModifier;
    }

    public setMcotsPoolingFrequency(mcotsPoolingFrequency: number): void {
        this.mcotsPoolingFrequency = mcotsPoolingFrequency;
    }

    public setStarterCash(starterCash: number): void {
        this.starterCash = starterCash;
    }

    public setEnableCheatEmails(enableCheatEmails: number): void {
        this.enableCheatEmails = enableCheatEmails;
    }

    public setSalaryPerLevel(salaryPerLevel: number): void {
        this.salaryPerLevel = salaryPerLevel;
    }

    public setClubMaxMembers(clubMaxMembers: number): void {
        this.clubMaxMembers = clubMaxMembers;
    }

    public setClubRegistrationFee(clubRegistrationFee: number): void {
        this.clubRegistrationFee = clubRegistrationFee;
    }

    public setClubReRegistrationFee(clubReRegistrationFee: number): void {
        this.clubReRegistrationFee = clubReRegistrationFee;
    }

    public setClassifiedAdBillRate(classifiedAdBillRate: number): void {
        this.classifiedAdBillRate = classifiedAdBillRate;
    }

    public setClassifiedAdMaxDays(classifiedAdMaxDays: number): void {
        this.classifiedAdMaxDays = classifiedAdMaxDays;
    }

    public setClassifiedAdMaxSize(classifiedAdMaxSize: number): void {
        this.classifiedAdMaxSize = classifiedAdMaxSize;
    }

    public setPapAwardPercentage(papAwardPercentage: number): void {
        this.papAwardPercentage = papAwardPercentage;
    }

    public setDealOfTheDayBrandedPartId(
        dealOfTheDayBrandedPartId: number
    ): void {
        this.dealOfTheDayBrandedPartId = dealOfTheDayBrandedPartId;
    }

    public setDealOfTheDayDiscount(dealOfTheDayDiscount: number): void {
        this.dealOfTheDayDiscount = dealOfTheDayDiscount;
    }
}

export function getTunables(): Tunables {
    return Tunables.getInstance();
}
