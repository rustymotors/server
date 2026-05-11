import type { UserData, UserInfo } from 'rusty-motors-shared';

// cNPS_User with tsMCity_UserData state bits
export class User {
    readonly personaId: number;
    userId: number;
    userName: string;
    isInLobby: boolean = true;
    isInTransition: boolean = false;
    isRacing: boolean = false;
    /** commId of current MCC channel when isInLobby=false */
    lobbyId: number = 0;
    userData: UserData | undefined;

    constructor(personaId: number, userId: number = 0, userName: string = '') {
        this.personaId = personaId;
        this.userId = userId;
        this.userName = userName;
    }

    setFromUserInfo(info: UserInfo): void {
        this.userId = info.userId;
        this.userName = info.userName;
        this.userData = info.userData;
    }
}
