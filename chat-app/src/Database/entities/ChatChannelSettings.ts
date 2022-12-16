import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from 'typeorm';
import {Setting} from '../../Objects/Setting';
import {SettingType} from '../../Enums/SettingType';
import {chat_channels} from './ChatChannels';
import {user_table} from './UserTable';
<<<<<<< HEAD

@Entity()
export class chat_channel_settings {
    constructor(setting: Setting) {
        if (setting == undefined)
            return;
=======
import {Logger} from "@nestjs/common";

@Entity()
export class chat_channel_settings {
    private readonly logger = new Logger('chat_channel_settings');
    constructor(setting: Setting) {
        if (setting == undefined) {
            this.logger.warn("Received undefined setting!")
            return;
        }
>>>>>>> main
        this.channelId = setting.channelId;
        this.actorUser = setting.actorId;
        this.affectedUser = setting.affectedId;
        this.from = setting.from;
        this.until = setting.until;
        this.setting = setting.setting;
    }

    @PrimaryColumn()
    channelId: number;

<<<<<<< HEAD
    @ManyToOne(() => chat_channels, (chat) => chat.chat)
    @JoinColumn({name: 'channelId'})
    channel: chat_channels;
=======
    @PrimaryColumn()
    setting: SettingType;
>>>>>>> main

    @PrimaryColumn()
    affectedUser: number;

    @Column()
    actorUser: number;

<<<<<<< HEAD
    @ManyToOne(() => user_table, (user) => user.setting)
    @JoinColumn({name: 'affectedUser'})
    user: user_table;

    @Column()
    from: number;

    @Column()
    until: number;

    @PrimaryColumn()
    setting: SettingType;
=======
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
>>>>>>> main
}
