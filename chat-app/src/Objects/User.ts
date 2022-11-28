import {Friend, IFriend} from './Friend';
import {Queries} from '../Database/Queries';
import {Logger} from '@nestjs/common';

export interface IUser {
    userId: number;
    name: string;
    avatar: object;
    blocked: IUser[];
    friends: IFriend[];
}

export class User {
    private static _users: User[] = [];
    private readonly _userId: number;

    constructor(userId: number, name: string, avatar: object) {
        this._userId = userId;
        this._name = name;
        this._avatar = avatar;
        this._blocked = [];
        this._friends = [];
        User.addUser(this);
        this.updateBlocked();
        this.updateFriends();
    }

    private _name: string;

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    private _avatar: object;

    get avatar(): object {
        return this._avatar;
    }

    set avatar(value: object) {
        this._avatar = value;
    }

    private _blocked: User[];

    get blocked(): User[] {
        return this._blocked;
    }

    private _friends: Friend[];

    get friends(): Friend[] {
        return this._friends;
    }

    get userId(): number {
        return this._userId;
    }

    public static async getUser(userId: number): Promise<User | undefined> {
        const users = this._users.filter((a) => a._userId == userId);
        if (users.length == 1)
            return users[0];
        const user: User = await Queries.getInstance().getUser(userId);
        if (user === undefined) {
            Logger.warn('Received request for user that does not exist in database.');
            return undefined;
        }
        return user;
    }

    public static removeUser(userId: number) {
        this._users = this._users.filter((a) => a._userId != userId);
    }

    private static addUser(user: User): void {
        this._users.push(user);
    }

    block(user: User) {
        if (this._blocked.filter((a) => a._userId == user._userId).length >= 1)
            return;
        this._blocked.push(user);
    }

    hasBlocked(user: User) {
        return this._blocked.filter((a) => a._userId == user._userId).length == 1;
    }

    unblock(user: User) {
        this._blocked = this._blocked.filter((a) => a._userId != user._userId);
    }

    friend(friend: Friend) {
        if (this._friends.filter((a) => a._userId == friend._userId).length >= 1)
            return;
        this._friends.push(friend);
    }

    isFriends(friend: Friend) {
        return (this._friends.filter((a) => a._userId == friend._userId && a.confirmed).length == 1);
    }

    hasRequest(friend: Friend) {
        return (this._friends.filter((a) => a._userId == friend._userId && !a.confirmed).length == 1);
    }

    unfriend(friend: User) {
        this._friends = this._friends.filter((a) => a._userId != friend._userId);
    }

    public getIUser(): IUser {
        return {
            userId: this.userId,
            name: this.name,
            avatar: this.avatar,
            blocked: this.blocked.map(blocked => blocked.getIUser()),
            friends: this.friends.map(blocked => blocked.getIFriend())
        }
    }

    private async updateBlocked() {
        this._blocked = await Queries.getInstance().getBlockedUsers(this._userId);
    }

    private async updateFriends() {
        this._friends = await Queries.getInstance().getFriends(this._userId, true);
    }
}
