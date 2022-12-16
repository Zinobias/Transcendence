import {IUser, User} from './User';
import {IMessage, Message} from './Message';
import {ISetting, Setting} from './Setting';
import {SettingType} from '../Enums/SettingType';

export interface IChannel {
    channelId: number;
    owner: number;
    otherOwner: number;
    channelName: string;
    users: IUser[];
    messages: IMessage[];
    settings: ISetting[];
    closed: boolean;
    visible: boolean;
    password: string;
}

export class Channel {
    private static _channels: Channel[] = [];
<<<<<<< HEAD
    private readonly _owner: number;
=======

    private static addChannel(channel: Channel): void {
        this._channels.push(channel);
    }

    public static getChannel(channelId: number): Channel | undefined {
        // const channels = this._channels.filter((a) => a._channelId == channelId);
        const channels = this._channels.find((e) => {
            return (e._channelId == channelId);
        });
        if (channels !== undefined)
            return channels;
        return undefined;
    }

    public static getUserChannels(userId: number): Channel[] {
        return this._channels.filter((channel) => {
            return channel.users.filter((user) => {
                return user.userId == userId
            }).length == 1
        });
    }

    public static removeChannel(channelId: number) {
        this._channels = this._channels.filter((a) => a._channelId != channelId);
    }

    private _channelId: number;
    private _owner: number;
>>>>>>> main
    private readonly _otherOwner: number;
    private readonly _messages: Message[];

    constructor(channelId: number, owner: number, channelName: string, users: User[], messages: Message[], settings: Setting[], closed: boolean, otherOwner: number | undefined, visible: boolean, password: string) {
        this._channelId = channelId;
        this._owner = owner;
        this._channelName = channelName;
        this._users = users;
        this._messages = messages;
        this._settings = settings;
        this._closed = closed;
        if (otherOwner != undefined)
            this._otherOwner = otherOwner;
        this._visible = visible;
        this._password = password;
        Channel.addChannel(this);
    }

    private _channelId: number;

    public get channelId(): number {
        return this._channelId;
    }

    public set channelId(value: number) {
        this._channelId = value;
    }

<<<<<<< HEAD
    private _channelName: string;
=======
    set owner(value: number) {
        this._owner = value;
    }

    public get otherOwner(): number {
        return this._otherOwner;
    }
>>>>>>> main

    public get channelName(): string {
        return this._channelName;
    }

    public set channelName(value: string) {
        this._channelName = value;
    }

    private _users: User[];

    public get users(): User[] {
        return this._users;
    }

    private _settings: Setting[];

    public get settings(): Setting[] {
        return this._settings;
    }

    private _closed: boolean;

    get closed(): boolean {
        return this._closed;
    }

    set closed(value: boolean) {
        this._closed = value;
    }

<<<<<<< HEAD
    private _visible: boolean;
=======
    public get settings(): Setting[] {
        return this._settings;
    }

    public hasSetting(affectedId: number, settingType: SettingType) {
        return this._settings.find((setting: Setting) => setting.affectedId == affectedId && setting.setting == settingType) != undefined;
    }

    public addSetting(setting: Setting) {
        this._settings.push(setting);
    }

    public removeSetting(userId: number, settingType: SettingType) {
        this._settings = this._settings.filter(
            (a) => !(a.affectedId == userId && a.setting === settingType),
        );
    }
>>>>>>> main

    get visible(): boolean {
        return this._visible;
    }

    set visible(value: boolean) {
        this._visible = value;
    }

    private _password: string;

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        this._password = value;
    }

    public get owner(): number {
        return this._owner;
    }

    public get otherOwner(): number {
        return this._otherOwner;
    }

    public get messages(): Message[] {
        return this._messages;
    }

    public static getChannel(channelId: number): Channel | undefined {
        // const channels = this._channels.filter((a) => a._channelId == channelId);
        const channels = this._channels.find((e) => {
            return (e._channelId == channelId);
        });
        if (channels !== undefined)
            return channels;
        return undefined;
    }

    public static getUserChannels(userId: number): Channel[] {
        return this._channels.filter((channel) => {
            return channel.users.filter((user) => {
                return user.userId == userId
            }).length == 1
        });
    }

    public static removeChannel(channelId: number) {
        this._channels = this._channels.filter((a) => a._channelId != channelId);
    }

    private static addChannel(channel: Channel): void {
        this._channels.push(channel);
    }

    public addUser(user: User) {
        this._users.push(user);
    }

    public removeUser(userId: number) {
        this._users = this._users.filter((a) => a.userId != userId);
    }

    public hasUser(userId: number): boolean {
        return this._users.filter((a) => a.userId == userId).length == 1;
    }

    public addSetting(setting: Setting) {
        this._settings.push(setting);
    }

    public removeSetting(userId: number, settingType: SettingType) {
        this._settings = this._settings.filter(
            (a) => !(a.affectedId == userId && a.setting === settingType),
        );
    }

    public isOwner(userId: number): boolean {
        return this.owner == userId || this.otherOwner == userId;
    }

    public isAdmin(userId: number): boolean {
        if (this.otherOwner !== undefined) return false;
        if (this.isOwner(userId)) return true;
        return (
            this.settings
                .filter((a) => a.setting === SettingType.ADMIN)
                .filter((a) => a.affectedId === userId).length == 1
        );
    }

    public canJoin(userId: number): boolean {
        return (
            this.settings
                .filter((a) => a.setting == SettingType.BANNED)
                .filter((a) => a.affectedId == userId).length == 0
        );
    }

    public getIChannel(): IChannel {
        return {
            channelId: this._channelId,
            owner: this._owner,
            otherOwner: this._otherOwner,
            channelName: this._channelName,
            users: this._users.map(user => {
                return user.getIUser()
            }),
            messages: this._messages.map(message => {
                return message.getIMessage()
            }),
            settings: this._settings.map(setting => {
                return setting.getISetting()
            }),
            closed: this._closed,
            visible: this._visible,
            password: this._password,
        }
    }

    addMessage(message: Message) {
        this.messages.push(message);
    }
}
