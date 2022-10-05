import {Friend} from "./Friend";

export class User {
    private static _users: User[] = [];

    private static addUser(user: User): void {
        this._users.push(user)
    }

    public static getUser(userId: number): User {
        let users = this._users.filter(a => a._userId == userId);
        if (users.length == 1)
            return users[0];
        return undefined;
    }

    public static removeUser(userId: number) {
        this._users = this._users.filter(a => a._userId != userId);
    }

    private readonly _userId: number;
    private readonly _loginId: string;
    private _name: string;
    private _avatar: object;
    private _blocked: User[];
    private _friends: Friend[];

    constructor(userId: number, loginId: string, name: string, avatar: object, blocked: User[], friends: Friend[]) {
        this._userId = userId;
        this._loginId = loginId;
        this._name = name;
        this._avatar = avatar;
        this._blocked = blocked;
        this._friends = friends;
        User.addUser(this);
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
        if (this._blocked.filter(a => a._userId == user._userId).length >= 1)
            return
        this._blocked.push(user);
    }

    hasBlocked(user: User) {
        return this._blocked.filter(a => a._userId == user._userId).length == 1;
    }

    unblock(user: User) {
        this._blocked = this._blocked.filter(a => a._userId != user._userId);
    }

    get friends(): Friend[] {
        return this._friends
    }

    friend(friend: Friend) {
        if (this._friends.filter(a => a._userId == friend._userId).length >= 1)
            return
        this._friends.push(friend);
    }

    isFriends(friend: Friend) {
        return this._friends.filter(a => a._userId == friend._userId && a.confirmed).length == 1;
    }

    hasRequest(friend: Friend) {
        return this._friends.filter(a => a._userId == friend._userId && !a.confirmed).length == 1;
    }

    unfriend(friend: User) {
        this._friends = this._friends.filter(a => a._userId != friend._userId);
    }
}