import { UserData, UserInfo } from 'rusty-motors-shared';

// cNPS_User
export class User {
    personaId: number;
    userId: number;
    userName: string;
    userData: UserData;
    connectionId: string;
    isInLobby: boolean;
    lobbyId: number;

    constructor(personaId: number, userId?: number) {
        this.personaId = personaId;
        this.userId = userId ?? personaId;
        this.userName = '';
        this.userData = new UserData();
        this.connectionId = '';
        this.isInLobby = false;
        this.lobbyId = 0;
    }

    setFromUserInfo(userInfo: UserInfo): void {
        this.userName = userInfo.userName ?? '';
        this.userData = userInfo.userData;
        this.personaId = userInfo.personaId;
    }
}
