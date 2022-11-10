import { User } from './User';
import { Message } from './Message';
import { Setting } from './Setting';
import { SettingType } from '../Enums/SettingType';

export class Channel {
  private static _channels: Channel[] = [];

  private static addChannel(channel: Channel): void {
    this._channels.push(channel);
  }

  public static getChannel(channelId: number): Channel {
    const channels = this._channels.filter((a) => a._channelId == channelId);
    if (channels.length == 1) return channels[0];
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

  constructor(
    channelId: number,
    owner: number,
    channelName: string,
    users: User[],
    messages: Message[],
    settings: Setting[],
    otherOwner?: number,
  ) {
    this._channelId = channelId;
    this._owner = owner;
    this._channelName = channelName;
    this._users = users;
    this._messages = messages;
    this._settings = settings;
    if (otherOwner != null) this._otherOwner = otherOwner;
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

  public isOwner(userId: number): boolean {
    return this.owner == userId || this.otherOwner == userId;
  }

  public isAdmin(userId: number): boolean {
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
}
