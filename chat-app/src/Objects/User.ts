import {Friend} from './Friend';
import {Queries} from '../Database/Queries';
import {Logger} from '@nestjs/common';

export interface IUser {
    userId: number;
    name: string;
    avatar: object;
    blocked: User[];
    friends: Friend[];
}

export class User {
    private static _users: User[] = [];

    private static addUser(user: User): void {
        this._users.push(user);
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

    private readonly _userId: number;
    private _name: string;
    private _avatar: object;
    private _blocked: User[];
    private _friends: Friend[];

    constructor(userId: number, name: string, avatar: object) {
        this._userId = userId;
        this._name = name;
        this._avatar = avatar;
        User.addUser(this);
        this.updateBlocked();
        this.updateFriends();
    }

    get userId(): number {
        return this._userId;
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

    get friends(): Friend[] {
        return this._friends;
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

    private async updateBlocked() {
        this._blocked = await Queries.getInstance().getBlockedUsers(this._userId);
    }

    private async updateFriends() {
        this._blocked = await Queries.getInstance().getBlockedUsers(this._userId);
    }

    public getIUser(): IUser {
        return {
            userId: this.userId,
            name: this.name,
            avatar: this.avatar,
            blocked: this.blocked,
            friends: this.friends,
        };
    }
}
