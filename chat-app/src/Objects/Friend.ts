import {IUser, User} from './User';

export interface IFriend {
    IUser: IUser;
    confirmed: boolean;
}

export class Friend extends User {
    private _confirmed: boolean;

    constructor(user: User, confirmed: boolean) {
        super(user.userId, user.name, user.avatar);
        this._confirmed = confirmed;
    }

    get confirmed(): boolean {
        return this._confirmed;
    }

    set confirmed(value: boolean) {
        this._confirmed = value;
    }

    public getIFriend(): IFriend {
        return {
            IUser: this.getIUser(),
            confirmed: this._confirmed
        }
    }
}
