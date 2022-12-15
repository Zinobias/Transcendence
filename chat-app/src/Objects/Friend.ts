import {IUser, SmallUser, User} from './User';

export interface IFriend {
    IUser: IUser;
    confirmed: boolean;
}

export class Friend {
    private _confirmed: boolean;
    private readonly _user: User;

    constructor(user: User, confirmed: boolean) {
        this._confirmed = confirmed;
        this._user = user;
    }

    get confirmed(): boolean {
        return this._confirmed;
    }

    set confirmed(value: boolean) {
        this._confirmed = value;
    }

    get user(): User {
        return this._user;
    }

    public getIFriend(): IFriend {
        return {
            IUser: this._user.getIUser(),
            confirmed: this._confirmed
        }
    }

    public getSmallFriend(): SmallUser {
        return {userId: this._user.userId, name: this._user.name, state: this._confirmed}
    }
}
