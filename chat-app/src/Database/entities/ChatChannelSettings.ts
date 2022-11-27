import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Setting } from '../../Objects/Setting';
import { SettingType } from '../../Enums/SettingType';
import { chat_channels } from './ChatChannels';
import { user_table } from './UserTable';

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

  @ManyToOne(() => chat_channels, (chat) => chat.chat)
  @JoinColumn({ name: 'channelId' })
  channel: chat_channels;

  @PrimaryColumn()
  affectedUser: number;

  @Column()
  actorUser: number;

  @ManyToOne(() => user_table, (user) => user.setting)
  @JoinColumn({ name: 'affectedUser' })
  user: user_table;

  @Column()
  from: number;

  @Column()
  until: number;

  @PrimaryColumn()
  setting: SettingType;
}
