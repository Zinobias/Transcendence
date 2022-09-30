export class User {
    private readonly _userId: number;
    private readonly _loginId: string;
    private _name: string;
    private _avatar: object;
    private readonly _blocked: User[];

    constructor(userId: number, loginId: string, name: string, avatar: object, blocked: User[]) {
        this._userId = userId;
        this._loginId = loginId;
        this._name = name;
        this._avatar = avatar;
        this._blocked = blocked;
    }

    get userId(): number {
        return this._userId;
    }

    get loginId(): string {
        return this._loginId;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get avatar(): object {
        return this._avatar;
    }

    set avatar(value: object) {
        this._avatar = value;
    }

    get blocked(): User[] {
        return this._blocked;
    }

    block(user: User) {
        if (this._blocked.filter(blockedUser => blockedUser === user).length >= 1)
            return
        this._blocked.push(user);
    }
}