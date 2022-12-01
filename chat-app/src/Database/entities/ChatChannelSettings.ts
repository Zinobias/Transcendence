import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from 'typeorm';
import {Setting} from '../../Objects/Setting';
import {SettingType} from '../../Enums/SettingType';
import {chat_channels} from './ChatChannels';
import {user_table} from './UserTable';

@Entity()
export class chat_channel_settings {
    constructor(setting: Setting) {
        if (setting == undefined)
            return;
        this.channelId = setting.channelId;
        this.actorUser = setting.actorId;
        this.affectedUser = setting.affectedId;
        this.from = setting.from;
        this.until = setting.until;
        this.setting = setting.setting;
    }

    @PrimaryColumn()
    channelId: number;

    @PrimaryColumn()
    setting: SettingType;

    @PrimaryColumn()
    affectedUser: number;

    @Column()
    actorUser: number;

    @Column()
    from: number;

    @Column()
    until: number;

    @ManyToOne(() => chat_channels, (chat) => chat.chatChannelSetting)
    @JoinColumn({name: 'channelId'})
    channel: chat_channels;

    @ManyToOne(() => user_table, (user) => user.settingAffectedUser)
    @JoinColumn({name: 'affectedUser'})
    affectedUserSetting: user_table;

    @ManyToOne(() => user_table, (user) => user.settingActorUser)
    @JoinColumn({name: 'actorUser'})
    actorUserSetting: user_table;
}
