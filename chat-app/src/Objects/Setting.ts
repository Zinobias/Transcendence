import {SettingType} from '../Enums/SettingType';

export interface ISetting {
    setting: SettingType;
    channelId: number;
    userId: number;
    from: number;
    until: number;
    actorId: number;
}

export class Setting {
    private readonly _setting: SettingType;
    private readonly _channelId: number;
    private readonly _userId: number;
    private readonly _from: number;
    private readonly _until: number;
    private readonly _actorId: number;

    constructor(setting: SettingType, channelId: number, userId: number, actorId: number, from: number, until: number) {
        this._setting = setting;
        this._channelId = channelId;
        this._userId = userId;
        this._actorId = actorId;
        this._from = from;
        this._until = until;
    }

    get setting(): SettingType {
        return this._setting;
    }

    get channelId(): number {
        return this._channelId;
    }

    get userId(): number {
        return this._userId;
    }

    get from(): number {
        return this._from;
    }

    get until(): number {
        return this._until;
    }

    public getISetting(): ISetting {
        return {
            setting: this._setting,
            channelId: this._channelId,
            userId: this._userId,
            from: this._from,
            until: this._until,
            actorId: this._actorId
        }
    }
}
