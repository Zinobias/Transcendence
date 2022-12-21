import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from 'typeorm';
import {Setting} from '../../Objects/Setting';
import {SettingType} from '../../Enums/SettingType';
import {chat_channels} from './ChatChannels';
import {user_table} from './UserTable';
import {Logger} from "@nestjs/common";

@Entity()
export class chat_channel_settings {
    private readonly logger = new Logger('chat_channel_settings');
    constructor(setting: Setting) {
        if (setting == undefined) {
            // this.logger.warn("Received undefined setting!")
            return;
        }
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

    @Column({type: 'bigint'})
    from: number;

    @Column({type: 'bigint'})
    until: number;

    @ManyToOne(() => chat_channels, (chat) => chat.chatChannelSetting)
    channel: chat_channels;

    @ManyToOne(() => user_table, (user) => user.settingAffectedUser)
    @JoinColumn({name: 'affectedUser'})
    affectedUserSetting: user_table;

    @ManyToOne(() => user_table, (user) => user.settingActorUser)
    @JoinColumn({name: 'actorUser'})
    actorUserSetting: user_table;
}
