import { User } from "./User";
import { Message } from "./Message";
import { Setting } from "./Setting";

export class Channel {
    private readonly _channelId: number;
    private readonly _owner: number;
    private readonly _otherOwner: number;
    private _channelName: string;
    private readonly _users: User[];
    private readonly _messages: Message[];
    private readonly _settings: Setting[];

    constructor(channelId: number, owner: number, channelName: string, users: User[], messages: Message[], settings: Setting[], otherOwner?: number) {
        this._channelId = channelId;
        this._owner = owner;
        this._channelName = channelName;
        this._users = users;
        this._messages = messages;
        this._settings = settings;
        if (otherOwner != null)
            this._otherOwner = otherOwner;
    }

    get channelId(): number {
        return this._channelId;
    }

    get owner(): number {
        return this._owner;
    }

    get otherOwner(): number {
        return this._otherOwner;
    }

    get channelName(): string {
        return this._channelName;
    }

    set channelName(value: string) {
        this._channelName = value;
    }

    get users(): User[] {
        return this._users;
    }

    get messages(): Message[] {
        return this._messages;
    }

    get settings(): Setting[] {
        return this._settings;
    }

    addSetting(setting: Setting) {
        this._settings.push(setting);
    }
}