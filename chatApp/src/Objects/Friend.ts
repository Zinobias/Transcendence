import {User} from "./User";

export class Friend extends User {
    private _confirmed: boolean;
    constructor(user: User, confirmed: boolean) {
        super(user.userId, user.loginId, user.name, user.avatar, user.blocked, user.friends);
        this._confirmed = confirmed;
    }

    get confirmed(): boolean {
        return this._confirmed;
    }

    set confirmed(value: boolean) {
        this._confirmed = value;
    }
}