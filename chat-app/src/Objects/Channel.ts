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

    private static addChannel(channel: Channel): void {
        this._channels.push(channel);
    }

    public static getChannel(channelId: number): Channel | undefined {
        const channels = this._channels.filter((a) => a._channelId == channelId);
        if (channels.length == 1)
            return channels[0];
        return undefined;
    }

    public static getUserChannels(userId: number): Channel[] {
        return this._channels.filter(
            (a) => a._users.filter((b) => b.userId == userId).length == 1,
        );
    }

    public static removeChannel(channelId: number) {
        this._channels = this._channels.filter((a) => a._channelId != channelId);
    }

    private _channelId: number;
    private readonly _owner: number;
    private readonly _otherOwner: number;
    private _channelName: string;
    private _users: User[];
    private readonly _messages: Message[];
    private _settings: Setting[];
    private _closed: boolean;
    private _visible: boolean;
    private _password: string;

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

    public set channelId(value: number) {
        this._channelId = value;
    }

    public get channelId(): number {
        return this._channelId;
    }

    public get owner(): number {
        return this._owner;
    }

    public get otherOwner(): number {
        return this._otherOwner;
    }

    public get channelName(): string {
        return this._channelName;
    }

    public set channelName(value: string) {
        this._channelName = value;
    }

    public get users(): User[] {
        return this._users;
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

    public get messages(): Message[] {
        return this._messages;
    }

    get closed(): boolean {
        return this._closed;
    }

    set closed(value: boolean) {
        this._closed = value;
    }

    public get settings(): Setting[] {
        return this._settings;
    }

    public addSetting(setting: Setting) {
        this._settings.push(setting);
    }

    public removeSetting(userId: number, settingType: SettingType) {
        this._settings = this._settings.filter(
            (a) => !(a.userId == userId && a.setting === settingType),
        );
    }

    get visible(): boolean {
        return this._visible;
    }

    set visible(value: boolean) {
        this._visible = value;
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        this._password = value;
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
                .filter((a) => a.userId === userId).length == 1
        );
    }

    public canJoin(userId: number): boolean {
        return (
            this.settings
                .filter((a) => a.setting == SettingType.BANNED)
                .filter((a) => a.userId == userId).length == 0
        );
    }

    public getIChannel(): IChannel {
        return {
            channelId: this._channelId,
            owner: this._owner,
            otherOwner: this._otherOwner,
            channelName: this._channelName,
            users: this._users.map(user => {return user.getIUser()}),
            messages: this._messages.map(message => {return message.getIMessage()}),
            settings: this._settings.map(setting => {return setting.getISetting()}),
            closed: this._closed,
            visible: this._visible,
            password: this._password,
        }
    }
}
